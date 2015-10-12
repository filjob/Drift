# Drift

***

## Introduction
Drift is a Firefox OS app calculating the drift (of a boat for example). It displays information about the drift in comparison to the true bearing initialy entered.

***

## Definitions and asumptions
* The true heading is the GPS heading that is taken as a reference to detect and calculate the drift.
* The indicated true heading is accurate enough if the precision reported by the GPS is less than 5 meters.
* The real heading is the real course of the vessel and is calculated based on the coordinates recorded at the same time of the true heading and the current coordinates of the vessel.
* The drift is the distance between the current coordinates and the coordinates that the vessel would have had if he had followed the true heading on the same distance.
![drift relative](/images/drift.png)
***

## Displayed information
* The true heading in degree (integer, abr. '°')
* The real heading in degree (integer, abr. '°')
* The current coordinates
* The drift in meter (integer, abr. 'm') if less than 1/10 nautical mile, in nautical mile (1 decimal point, abr. 'NM') if greater or equal to 1/10 NM
* The current coordinates
* The speed in knots (1 decimal point, abr. 'kn')
* The time (format 'HH:MM:SS') since the true heading has been recorded.
* the accuracy of the GPS

***

## Calculation method
Different formulas are available to calculate distance between coordinates, corresponding heading, new coordinates. Chris Veness is exposing them in a great article called "[Calculate distance, bearing and more between Latitude/Longitude points](http://www.movable-type.co.uk/scripts/latlong.html)". The formulas which have been retained from this article for the Drift application are the following:

### Distance between 2 coordinates:
**Haversine formula:**  
a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)  
c = 2 ⋅ atan2( √a, √(1−a) )  
d = R ⋅ c  
where φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371,000 m)  

### Heading from one coordinate point to another
**Formula:**  
θ = atan2( sin Δλ ⋅ cos φ2 , cos φ1 ⋅ sin φ2 − sin φ1 ⋅ cos φ2 ⋅ cos Δλ )  
where φ is latitude, λ is longitude  

### Destination point given distance and heading from start point
**Formula:**  
φ2 = asin( sin φ1 ⋅ cos δ + cos φ1 ⋅ sin δ ⋅ cos θ )  
λ2 = λ1 + atan2( sin θ ⋅ sin δ ⋅ cos φ1, cos δ − sin φ1 ⋅ sin φ2 )  
where φ is latitude, λ is longitude, θ is the heading (clockwise from north), δ is the angular distance d/R; d being the distance travelled, R the earth’s radius (mean radius = 6,371,000 m)  

***

## Development plan
### 0.1.0 - beta, released
- Core drift functionality
- Languages: fr, en, en-US

### 1.0.0 - release submitted
- Bugfix
  1. Correction of the formula to calculate drift distance
  2. Integer systematically converted to float before calculation
  3. Code clean-up
- Display of the current coordinates added
- Look & feel improvement: new logo, background image, new colors

### 1.0.x
- Bugfix
- Languages: de, es

### 1.1.0
- Language selection
- GPS accuracy setting
- Time between 2 calculation setting

### 1.1.x
- Bugfix

### 1.2.0
- Drift threshold trigering an alarm

### 1.2.x
- Bugfix

***

## Source and reference
* [Calculate distance, bearing and more between Latitude/Longitude points](http://www.movable-type.co.uk/scripts/latlong.html) by Chris Veness: Formulas for various calculation with coordinates and corresponding javascript code.
* [Current and Drift](http://www.plato.is/navigation/current_and_drift/) inspired my above drawing
* Help requested in Stack Overflow:
  + [How to properly close a Firefox OS app?](http://stackoverflow.com/questions/31076284/how-to-properly-close-a-firefox-os-app)
  + [innerhtml value does not change when data-l10n-id attribute is changed](http://stackoverflow.com/questions/30435230/innerhtml-value-does-not-change-when-data-l10n-id-attribute-is-changed)
* [Compass picture](http://all-free-download.com/free-photos/download/compass_02_hd_picture_166637.html) by [zcool.com.cn](http://zcool.com.cn): The photo used to design the app icon and backround
