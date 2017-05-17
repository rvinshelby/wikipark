import { Component, ViewChild, ElementRef, Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { NavController } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Http } from '@angular/http';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
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
  public destination: any;
  items: FirebaseListObservable<any[]>;

  constructor(private localnotif: LocalNotifications, private http: Http, public navCtrl: NavController, public zone: NgZone, private geolocation: Geolocation, private backgroundGeolocation: BackgroundGeolocation, private db: AngularFireDatabase) {
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
  let render = new google.maps.DirectionsRenderer();
  this.watch = this.geolocation.watchPosition(this.options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
    this.zone.run(() => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
      marker.setPosition({lat: position.coords.latitude , lng: position.coords.longitude});
      map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
      this.markParkingSpaces(this.map, this.lat, this.lng);
      if(this.destination == null)
      {
        console.log('huhu');
      } else {
        console.log('working');
        this.renderRoute(new google.maps.LatLng(this.lat, this.lng), this.destination);
      }
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

    markParkingSpaces(map, lat, lng){
      let iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
      let features = [
              {
                position: new google.maps.LatLng(14.829424, 120.281571),
                type: 'parking',
                content : 'Parking 1',
              },
              {
                position: new google.maps.LatLng(14.829389, 120.281588),
                type: 'parking',
                content : 'Parking 2',
              },
              {
                position: new google.maps.LatLng(14.829344, 120.281612),
                type: 'parking',
                content : 'Parking 3',
              },
              {
                position: new google.maps.LatLng(14.829287, 120.281642),
                type: 'parking',
                content : 'Parking 4',
              },
              {
                position: new google.maps.LatLng(14.829254, 120.281658),
                type: 'parking',
                content : 'Parking 5',
              },
              {
                position: new google.maps.LatLng(14.829220, 120.281687),
                type: 'parking',
                content : 'Parking 6',
              },
              {
                position: new google.maps.LatLng(14.829183, 120.281699),
                type: 'parking',
                content : 'Parking 7',
              },
              {
                position: new google.maps.LatLng(14.829137, 120.281722),
                type: 'parking',
                content : 'Parking 8',
              },
              {
                position: new google.maps.LatLng(14.829089, 120.281755),
                type: 'parking',
                content : 'Parking 9',
              },
              {
                position: new google.maps.LatLng(14.829055, 120.281765),
                type: 'parking',
                content : 'Parking 10',
              },
        ];

      let icons = {
            parking: {
              name: 'Parking',
              icon: iconBase + 'parking_lot_maps.png'
            }
          };
      let des;
       for (let i in features) {
          let parking = new google.maps.Marker({
            position: features[i].position,
            icon: icons[features[i].type].icon,
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
            this.destination = features[i].position;
            let render = new google.maps.DirectionsRenderer();
              render.setMap(null);
              render = null;
              render = new google.maps.DirectionsRenderer();
              render.setMap(this.map);
              let service = new google.maps.DirectionsService();
              let request = {
                  origin: new google.maps.LatLng(lat, lng),
                  destination: features[i].position,
                  travelMode: google.maps.TravelMode.DRIVING
              };
              service.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                  render.setDirections(response);
                } else {
                  console.log(status);
                }
              });
              des = parking.destination;
              console.log(des);
            new google.maps.InfoWindow({
                content: features[i].content
            }).open(map, parking);
          });
        };
        console.log(des);
        this.destination = des;
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