import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { LocationTracker } from '../../providers/location-tracker';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  latLng: any;
  constructor(public navCtrl: NavController, public locationTracker: LocationTracker, private geolocation: Geolocation) {
  }

  ionViewDidLoad(){
    this.loadMap();
  }

  loadMap(){
    this.geolocation.getCurrentPosition().then((position) => {
    this.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
    let mapOptions = {
      center: this.latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
      });

    this.locationTracker.updateMarker(marker);
    this.markParkingSpaces(this.map);
    }, (err) => {
      console.log(err);
    });
  }

    markParkingSpaces(map){
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
          parking.addListener('click', function() {
            infowindow.open(map, parking);
          });
        });
      }
}