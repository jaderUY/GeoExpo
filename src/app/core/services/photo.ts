import { Injectable } from '@angular/core';
import { Camera, } from '@capacitor/camera';

export interface Photo {
  name: string;
  source: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {

  constructor() { }

  async takePhoto(): Promise<Photo> {
    const captured = await Camera.takePhoto({
      quality: 90,
      saveToGallery: false,
    });
    const now = new Date();
    return {
      name: `photo_${now.getTime()}.jpg`,
      source: captured.webPath || '',
      createdAt: now.toISOString(),
    };
  }
}