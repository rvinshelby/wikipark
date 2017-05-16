import { Component, ViewChild, ElementRef, Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

declare var google;
declare var H;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('panel') panelElement: ElementRef;
  map: any;
  latLng: any;
  directionsDisplay: any;
  public watch: any;
  public lat: number = 0;
  public lng: number = 0;
  platform: any;

  constructor(private http: Http, public navCtrl: NavController, public zone: NgZone, private geolocation: Geolocation, private backgroundGeolocation: BackgroundGeolocation) {
    this.platform = new H.service.Platform({
      'app_id': 'wAjra6V7CcDCPY6Nf1vK',
      'app_code': '6vgqJ29azm2D7KVB3QbTFQ'
    });
  }

  ionViewDidLoad(){
    this.loadHereMap();
  }

  updateMarker(marker) {
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
  
  let options = {
    frequency: 3000, 
    enableHighAccuracy: true
  };
  
  this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
    this.zone.run(() => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
      marker.setPosition({lat: position.coords.latitude , lng: position.coords.longitude});
      this.markParkingSpaces(this.map, this.lat, this.lng);
    });
  });
  
}

  loadHereMap() {
    this.geolocation.getCurrentPosition().then((position) => {
      console.log(position);
     let maptypes = this.platform.createDefaultLayers();
     this.map = new H.Map(
       this.mapElement.nativeElement,
       maptypes.satellite.map,
        {   
          zoom: 18,
          center: { lng: position.coords.longitude, lat: position.coords.latitude }
        }
     );
     let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map))
     let marker = new H.map.Marker({lat: position.coords.latitude, lng: position.coords.longitude});
     this.map.addObject(marker);
     this.updateMarker(marker);
     this.addParkingMarker(this.map);
    });
  }

  addParkingMarker(map) {
    let iconUrl = new H.map.Icon('https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png');
    let spaces = [
              {
                position:{lat: 14.829424, lng: 120.281571},
                content : 'Parking 1',
              },
              {
                position: {lat: 14.829389, lng: 120.281588},
                content : 'Parking 2',
              },
              {
                position: {lat: 14.829344, lng: 120.281612},
                content : 'Parking 3',
              },
              {
                position: {lat: 14.829287, lng: 120.281642},
                content : 'Parking 4',
              },
              {
                position: {lat: 14.829254, lng: 120.281658},
                content : 'Parking 5',
              },
              {
                position: {lat: 14.829220, lng: 120.281687},
                content : 'Parking 6',
              },
              {
                position: {lat: 14.829183, lng: 120.281699},
                content : 'Parking 7',
              },
              {
                position: {lat: 14.829137, lng: 120.281722},
                content : 'Parking 8',
              },
              {
                position: {lat: 14.829089, lng: 120.281755},
                content : 'Parking 9',
              },
              {
                position: {lat: 14.829055, lng: 120.281765},
                content : 'Parking 10',
              },
        ];
        spaces.forEach(function(space) {
          let spaceMarker = new H.map.Marker(space.position, iconUrl);
          map.addObject(spaceMarker);
        });
  }

  loadMap(){
    this.geolocation.getCurrentPosition().then((position) => {
    this.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    let mapOptions = {
      center: this.latLng,
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      });
    this.updateMarker(marker);
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

       features.forEach(function(feature) {
          let infowindow = new google.maps.InfoWindow({
              content: feature.content
          });
          let parking = new google.maps.Marker({
            position: feature.position,
            icon: icons[feature.type].icon,
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
              let render = new google.maps.DirectionsRenderer({'map' : null});
              render.setMap(this.map);
              render.setPanel(this.panelElement);
              let service = new google.maps.DirectionsService();
              let request = {
                  origin: new google.maps.LatLng(lat, lng),
                  destination: feature.position,
                  travelMode: google.maps.TravelMode.DRIVING
              };
              service.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                  render.setDirections(response);
                } else {
                  console.log(status);
                }
              });
            infowindow.open(map, parking);
          });
        });
      }
}