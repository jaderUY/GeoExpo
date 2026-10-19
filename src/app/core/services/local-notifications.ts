import { Injectable, computed, signal } from '@angular/core';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { ActionPerformed, LocalNotifications, LocalNotificationSchema, PendingLocalNotificationSchema, PermissionStatus,
} from '@capacitor/local-notifications';


export type NotifPermission = PermissionStatus['display']; // 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied'

const CHANNEL_ID = 'geoexpo-recordatorios';
const ACTION_TYPE_ID = 'RECORDATORIO_GEOEXPO';

@Injectable({ 
    providedIn: 'root'
})
export class LocalNotificationsService {
  // ---------- Estado (Signals) ----------
  readonly permission = signal<NotifPermission>('prompt');
  readonly pending = signal<PendingLocalNotificationSchema[]>([]);
  readonly lastReceived = signal<LocalNotificationSchema | null>(null); 
  readonly lastAction = signal<ActionPerformed | null>(null);

  // ---------- Derivados ----------
  readonly granted = computed(() => this.permission() === 'granted');
  readonly pendingCount = computed(() => this.pending().length);
  readonly isNative = Capacitor.isNativePlatform();

  private listeners: PluginListenerHandle[] = [];
  private initialized = false;
  // Los IDs deben caber en un int de 32 bits para Android
  private seq = Math.floor(Date.now() / 1000) % 1_000_000_000;

  /** 
   * Llamar una vez al arrancar la app (idealmente en AppComponent). 
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    if (this.isNative) {
      // 1. Android 8+: Crear el canal (necesario para que las notificaciones suenen/vibren)
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: CHANNEL_ID,
          name: 'Notificaciones GeoExpo',
          description: 'Avisos y confirmaciones de la app',
          importance: 4, // HIGH: sonido + banner flotante (heads-up)
          visibility: 1, // PUBLIC
          vibration: true,
        });
      }

      // 2. Registrar botones de acción (Opcional, para futuros recordatorios)
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: ACTION_TYPE_ID,
            actions: [
              { id: 'hecho', title: 'Entendido' },
              { id: 'posponer', title: 'Posponer 5 min' },
            ],
          },
        ],
      });
    }

    // 3. Escuchar eventos
    this.listeners.push(
      await LocalNotifications.addListener('localNotificationReceived', (n) => {
        this.lastReceived.set(n);
        void this.refreshPending();
      }),
      await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        this.lastAction.set(action);
        if (action.actionId === 'posponer') {
          void this.snooze(action.notification, 5 * 60);
        }
        void this.refreshPending();
      }),
    );

    // 4. Revisar estado inicial
    const status = await LocalNotifications.checkPermissions();
    this.permission.set(status.display);
    await this.refreshPending();
  }

  /**
   * Solicita permisos al usuario (necesario en iOS y Android 13+)
   */
  async requestPermission(): Promise<boolean> {
    const status = await LocalNotifications.requestPermissions();
    this.permission.set(status.display);
    return status.display === 'granted';
  }

  /**
   * Programa una notificación única dentro de N segundos.
   * (Este es el método que usaremos para reemplazar los ion-toast)
   */
  async scheduleIn(seconds: number, title: string, body: string): Promise<number | null> {
    if (!(await this.ensurePermission())) return null;

    const id = this.nextId();
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          channelId: CHANNEL_ID,
          actionTypeId: ACTION_TYPE_ID,
          extra: { createdAt: new Date().toISOString() },
          schedule: {
            at: new Date(Date.now() + seconds * 1000),
            allowWhileIdle: true, // Android: dispara aunque el equipo esté en modo ahorro
          },
        },
      ],
    });
    await this.refreshPending();
    return id;
  }

  /**
   * Programa una notificación que se repite todos los días a una hora específica.
   */
  async scheduleDaily(hour: number, minute: number, title: string, body: string): Promise<number | null> {
    if (!(await this.ensurePermission())) return null;

    const id = this.nextId();
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          channelId: CHANNEL_ID,
          actionTypeId: ACTION_TYPE_ID,
          schedule: { on: { hour, minute }, allowWhileIdle: true },
        },
      ],
    });
    await this.refreshPending();
    return id;
  }

  /**
   * Cancela una notificación por su ID
   */
  async cancel(id: number): Promise<void> {
    await LocalNotifications.cancel({ notifications: [{ id }] });
    await this.refreshPending();
  }

  /**
   * Cancela todas las notificaciones pendientes
   */
  async cancelAll(): Promise<void> {
    const ids = this.pending().map((n) => ({ id: n.id }));
    if (ids.length) await LocalNotifications.cancel({ notifications: ids });
    await this.refreshPending();
  }

  /**
   * Actualiza la lista de notificaciones pendientes
   */
  async refreshPending(): Promise<void> {
    try {
      const { notifications } = await LocalNotifications.getPending();
      this.pending.set(notifications);
    } catch {
      this.pending.set([]); // En web algunas APIs no están implementadas
    }
  }

  /**
   * Limpia los listeners (útil en ngOnDestroy del AppComponent si fuera necesario)
   */
  async destroy(): Promise<void> {
    await Promise.all(this.listeners.map((l) => l.remove()));
    this.listeners = [];
    this.initialized = false;
  }

  // ---------- Privados ----------
  private async ensurePermission(): Promise<boolean> {
    return this.granted() || (await this.requestPermission());
  }

  private async snooze(n: LocalNotificationSchema, seconds: number): Promise<void> {
    await this.scheduleIn(seconds, n.title, n.body);
  }

  private nextId(): number {
    return ++this.seq;
  }
}