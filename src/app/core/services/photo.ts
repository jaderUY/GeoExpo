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
    const captured = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
    });
    const now = new Date();
    return {
      name: `photo_${now.getTime()}.${captured.format}`,
      source: captured.webPath ?? '',
      createdAt: now.toISOString(),
    };
  }
}