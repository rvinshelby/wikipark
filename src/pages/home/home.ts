import { Component, ViewChild, ElementRef, Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { NavController } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Http } from '@angular/http';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Subject } from 'rxjs/Subject';
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
  parkingspaces: any;
  public destination: any;
  items: FirebaseListObservable<any[]>;

  constructor(private localnotif: LocalNotifications, private http: Http, public navCtrl: NavController, public zone: NgZone, private geolocation: Geolocation, private backgroundGeolocation: BackgroundGeolocation, private db: AngularFireDatabase) {
    this.items = db.list('/parking_spaces');
    this.localnotif.registerPermission();
    if(this.localnotif.hasPermission()) {
      this.localnotif.schedule({
        id: 1,
        text: 'test',
        at: Date.now()
      });
    } else {
      this.localnotif.registerPermission();
    }
  }

  ionViewDidLoad(){
    this.loadMap();
  }

  updateMarker(marker, map) {
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
      map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
      this.items.subscribe(parking_spaces => {
        this.markParkingSpaces(this.map, this.lat, this.lng, parking_spaces);
      });
    });
  });
  
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
      let iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
      let icons = {
            parking: {
              name: 'Parking',
              icon: iconBase + 'parking_lot_maps.png'
            }
          };
       for (let i in spaces) {
          let parking = new google.maps.Marker({
            position:  new google.maps.LatLng(spaces[i].lat, spaces[i].lng),
            icon: icons[spaces[i].type].icon,
            map: map
          });

          let rec = new google.maps.Circle({
            map: map,
            radius: 3,
            fillColor: '#AA0000',
            strokeOpacity: 0,
          });

          rec.bindTo('center', parking, 'position');
          parking.addListener('click', function() {
            let render = new google.maps.DirectionsRenderer();
              render.setMap(null);
              render = null;
              render = new google.maps.DirectionsRenderer();
              render.setMap(this.map);
              let service = new google.maps.DirectionsService();
              let request = {
                  origin: new google.maps.LatLng(lat, lng),
                  destination: new google.maps.LatLng(spaces[i].lat, spaces[i].lng),
                  travelMode: google.maps.TravelMode.DRIVING
              };
              service.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                  render.setDirections(response);
                } else {
                  console.log(status);
                }
              });
            new google.maps.InfoWindow({
                content: spaces[i].content
            }).open(map, parking);
          });
        };
        this.watch = this.geolocation.watchPosition(this.options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
          this.zone.run(() => {
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
            // console.log(this.destination);
          });
        });
        
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