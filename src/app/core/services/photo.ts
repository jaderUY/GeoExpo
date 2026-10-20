import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; 

export interface Photo {
  name: string;
  source: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {
  async takePhoto(): Promise<Photo> {
    // CORRECCIÓN AQUÍ:
    const captured = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt, // Permite elegir cámara o galería
      saveToGallery: false,
    });
    
    const now = new Date();
    return {
      name: `photo_${now.getTime()}.${captured.format}`,
      source: captured.webPath || '',
      createdAt: now.toISOString(),
    };
  }
}