import { Injectable, NgZone, ViewChild, ElementRef } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';

declare var google;

@Injectable()
export class LocationTracker {
  public watch: any;
  public lat: number = 0;
  public lng: number = 0;

  constructor(public zone: NgZone, private geolocation: Geolocation, private backgroundGeolocation: BackgroundGeolocation) {

  }

  updateMarker(marker) {
// Background Tracking
 console.log(marker);
  let config = {
    desiredAccuracy: 0,
    stationaryRadius: 20,
    distanceFilter: 10, 
    debug: true,
    interval: 2000 
  };
 
  this.backgroundGeolocation.configure(config).subscribe((location) => {
    this.zone.run(() => {
      this.lat = location.latitude;
      this.lng = location.longitude;
    });
 
  }, (err) => {
 
    console.log(err);
 
  });
 
  this.backgroundGeolocation.start();
  
  let options = {
    frequency: 3000, 
    enableHighAccuracy: true
  };
  
  this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
  
    console.log(position);
  
    this.zone.run(() => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
      marker.setPosition({lat: position.coords.latitude , lng: position.coords.longitude});
    });
  
  });
  
  }
}
