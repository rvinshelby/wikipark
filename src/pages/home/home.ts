import { Component, ViewChild, ElementRef, Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { NavController } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable  } from 'angularfire2/database';
import { Subject } from 'rxjs/Subject';
import { PushNotificationsService  } from 'angular2-notifications';
import 'rxjs/add/operator/map';

declare var google;
declare var H;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  latLng: any;
  public watch: any;
  public lat: number = 0;
  public lng: number = 0;
  platform: any;
  options: any;
  items: FirebaseListObservable<any[]>;
  item: FirebaseObjectObservable<any>;
  triggered: any;

  constructor(private localnotif: LocalNotifications, public navCtrl: NavController, public zone: NgZone, private geolocation: Geolocation, private backgroundGeolocation: BackgroundGeolocation, private db: AngularFireDatabase, private _service: PushNotificationsService  ) {
    this.triggered = true;
    if(!this._service.isSupported()) { this._service.requestPermission() }
    window.localStorage.clear();
    this.items = db.list('/parking_spaces');
  }

  ionViewDidLoad(){
    window.localStorage.clear();
    this.loadMap();
  }

  updateMarker(marker, map, route = null) {
// Background Tracking
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
  
  this.options = {
    frequency: 1000, 
    enableHighAccuracy: true
  };
  this.watch = this.geolocation.watchPosition(this.options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
    this.zone.run(() => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
      marker.setPosition({lat: position.coords.latitude , lng: position.coords.longitude});
      // map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
      this.items.subscribe(parking_spaces => {
        this.markParkingSpaces(this.map, this.lat, this.lng, parking_spaces);
      });
    });
  });
        if(window.localStorage.getItem('enroute') !== null)
        {
          let route = JSON.parse(window.localStorage.getItem('enroute'));
          this.item = this.db.object('/parking_spaces/' + route[1]);
          this.item.subscribe(parking_space => {
            var curpos = new google.maps.LatLng(this.lat, this.lng);
            var enroute_pos = new google.maps.LatLng(route[0].lat, route[0].lng);
            var circ_rad = window.localStorage.getItem('circle_radius');
            if(this.checkInside(curpos, enroute_pos, circ_rad)) {
              window.localStorage.clear();
              alert('You are now parked');
              this._service.create('You are now parked').subscribe(
                res => console.log(res),
                err => console.log(err)
              );
             map.event.trigger(map, 'resize');
            }
            if(route[0].state !== parking_space.state)
            {
              window.localStorage.clear();
              if(!this.triggered)
              {
                alert('test');
                this.triggered = true;
              }
              this._service.create('Parking Space Occupied', {body : route[0].content + ' has been occupied'}).subscribe(
                res => console.log(res),
                err => console.log(err)
              );
              map.event.trigger(map, 'resize');
            } else {
              this.triggered = false;
            }
          });
        }
}

checkInside(point, center, radius) {
  return (google.maps.geometry.spherical.computeDistanceBetween(point, center) <= radius)
}

  loadMap(){
    this.geolocation.getCurrentPosition().then((position) => {
    this.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    let mapOptions = {
      center: this.latLng,
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      });
    this.updateMarker(marker, this.map);
    }, (err) => {
      console.log(err);
    });
  }

    markParkingSpaces(map, lat, lng, spaces){
       for (let i in spaces) {
          let parking = new google.maps.Marker({
            position:  new google.maps.LatLng(spaces[i].lat, spaces[i].lng),
            map: map
          });
          if(spaces[i].state == 1)
          {
            parking.setIcon('https://firebasestorage.googleapis.com/v0/b/wikipark-39c42.appspot.com/o/parking_avail.png?alt=media&token=aee13194-9d1a-47d7-b6db-6062416c851a');
          } else {
            parking.setIcon('https://firebasestorage.googleapis.com/v0/b/wikipark-39c42.appspot.com/o/parking_not_avail.png?alt=media&token=2a49dfb1-6f78-4f69-a070-baedcc7ca8af');
          }
          parking.addListener('click', () => {
          let circle = new google.maps.Circle({
            map: map,
            radius: 3,
            fillOpacity: 0,
            strokeOpacity: 0,
          });
          window.localStorage.setItem('enroute', JSON.stringify([spaces[i], spaces[i].$key]));
          window.localStorage.setItem('circle_radius', circle.radius);
          circle.bindTo('center', parking, 'position');
            let pos = new google.maps.LatLng(lat, lng);
            if(spaces[i].state == 1) {
              this.renderRoute(pos, parking.position);
              if(window.localStorage.getItem('currentuser') == null)
              {
                this.renderRoute(pos, parking.position);
              }
              new google.maps.InfoWindow({
                  content: spaces[i].content + ' is Available'
              }).open(map, parking);
            } else {
              new google.maps.InfoWindow({
                  content: spaces[i].content + ' is not Available'
              }).open(map, parking);
            }
          });
        };
      }

    renderRoute(pos, des)
    {
      let render = new google.maps.DirectionsRenderer();
      render.setMap(null);
      render = null;
      render = new google.maps.DirectionsRenderer();
      render.setMap(this.map);
      let service = new google.maps.DirectionsService();
      let request = {
          origin: pos,
          destination: des,
          travelMode: google.maps.TravelMode.DRIVING
      };

      service.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          render.setDirections(response);
        } else {
          console.log(status);
        }
      });
    }
}