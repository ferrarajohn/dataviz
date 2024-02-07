function initMap() {
    const mapCenter = { lat: 0, lng: 0 };
    const mapOptions = {
        zoom: 13,
        center: mapCenter
    };
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);

    const storesList = document.getElementById("storesList");
    const searchButton = document.getElementById("searchButton");
    const currentLocationButton = document.getElementById("currentLocationButton");

    let userLocation = null; // Declare userLocation outside of functions

    window.addEventListener("load", () => {
        getUserCurrentLocation();
    });

    searchButton.addEventListener("click", () => {
        const zipCode = document.getElementById("zipCode").value;
        geocodeZipCode(zipCode);
        document.getElementById("map").scrollIntoView({ behavior: "smooth" });
    });
    
    currentLocationButton.addEventListener("click", () => {
        getUserCurrentLocation();
        document.getElementById("map").scrollIntoView({ behavior: "smooth" });
    });
    
    // // Get the zip code input element
    // const zipCodeInput = document.getElementById("zipCode");
    
    // // Add an event listener for the "keyup" event on the zip code input field
    // zipCodeInput.addEventListener("keyup", event => {
    //     if (event.key === "Enter") {
    //         event.preventDefault(); // Prevent default form submission behavior
    //         // If Enter key is pressed, trigger the search
    //         const zipCode = zipCodeInput.value;
    //         geocodeZipCode(zipCode);
    //     }
    // });

    function geocodeZipCode(zipCode) {
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=AIzaSyBHi9tYkUx45nIjN0F-UKgPi4XvQ1Y59Xg`)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0 && data.results[0].geometry) {
                    const zipCodeLocation = data.results[0].geometry.location;
                    map.setCenter(zipCodeLocation);
                    searchNearbyStores(zipCodeLocation);
    
                    // Create a blue marker with a ripple effect
                    const zipCodeLocationMarker = new google.maps.Marker({
                        position: zipCodeLocation,
                        map: map,
                        title: "Your Location",
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 5,
                            fillColor: "#0000FF", // Blue color
                            fillOpacity: 0.8,
                            strokeColor: "#0000FF", // Blue color
                            strokeOpacity: 0.8,
                            strokeWeight: 2
                        }
                    });
    
                    // Create a circle overlay for the ripple effect
                    const circle = new google.maps.Circle({
                        center: zipCodeLocation,
                        radius: 250, // Adjust the radius as needed
                        strokeColor: "#0099FF", // Blue color
                        strokeOpacity: 0.3, // Semi-transparent
                        strokeWeight: 2,
                        fillColor: "#0099FF", // Blue color
                        fillOpacity: 0.1, // Semi-transparent
                        map: map
                    });
    
                    // Add a pulsing effect to the circle
                    let fillOpacity = 0.1;
                    let increasing = true;
    
                    setInterval(() => {
                        if (increasing) {
                            fillOpacity += 0.01;
                            if (fillOpacity >= 0.5) {
                                increasing = false;
                            }
                        } else {
                            fillOpacity -= 0.01;
                            if (fillOpacity <= 0.1) {
                                increasing = true;
                            }
                        }
    
                        circle.setOptions({
                            fillOpacity: fillOpacity
                        });
                    }, 50); // Adjust the interval and step size as needed
    
                } else {
                    console.error("Invalid geocoding response:", data);
                }
            })
            .catch(error => {
                console.error("Error geocoding zip code:", error);
            });
    }
    
    function getUserCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    map.setCenter(userLocation);
                    searchNearbyStores(userLocation);
    
                    const userLocationMarker = new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        title: "Your Location",
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 5,
                            fillColor: "#0000FF", // Blue color
                            fillOpacity: 0.8,
                            strokeColor: "#0000FF", // Blue color
                            strokeOpacity: 0.8,
                            strokeWeight: 2
                        }
                    });
    
                    // Create a circle overlay for the ripple effect
                    const circle = new google.maps.Circle({
                        center: userLocation,
                        radius: 250, // Adjust the radius as needed
                        strokeColor: "#0099FF", // Blue color
                        strokeOpacity: 0.3, // Semi-transparent
                        strokeWeight: 2,
                        fillColor: "#0099FF", // Blue color
                        fillOpacity: 0.1, // Semi-transparent
                        map: map
                    });
    
                    // Add a pulsing effect to the circle
                    let fillOpacity = 0.1;
                    let increasing = true;
    
                    setInterval(() => {
                        if (increasing) {
                            fillOpacity += 0.01;
                            if (fillOpacity >= 0.5) {
                                increasing = false;
                            }
                        } else {
                            fillOpacity -= 0.01;
                            if (fillOpacity <= 0.1) {
                                increasing = true;
                            }
                        }
    
                        circle.setOptions({
                            fillOpacity: fillOpacity
                        });
                    }, 50); // Adjust the interval and step size as needed
                },
                error => {
                    console.error("Error getting current location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }

    function calculateDistance(coord1, coord2) {
        const R = 6371; // Radius of the Earth in kilometers
        const lat1Rad = (coord1.lat * Math.PI) / 180; // Convert latitudes to radians
        const lon1Rad = (coord1.lng * Math.PI) / 180; // Convert longitudes to radians
        const lat2Rad = (coord2.lat * Math.PI) / 180;
        const lon2Rad = (coord2.lng * Math.PI) / 180;
    
        const dLat = lat2Rad - lat1Rad;
        const dLon = lon2Rad - lon1Rad;
    
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
        const distanceInKm = R * c;
        const distanceInMiles = distanceInKm * 0.621371; // Convert to miles
    
        return distanceInMiles;
    }

    function searchNearbyStores(userLocation) {
        const placesService = new google.maps.places.PlacesService(map);
        const placesRequest = {
            location: userLocation,
            radius: 10000,
            type: ["cafe"]
        };
    
        placesService.nearbySearch(placesRequest, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                storesList.innerHTML = ""; // Clear previous results
    
                results.forEach(store => {
                    const storeLocation = {
                        lat: store.geometry.location.lat(),
                        lng: store.geometry.location.lng()
                    };
    
                    // Calculate the distance between userLocation and storeLocation
                    const distance = calculateDistance(userLocation, storeLocation).toFixed(2);
    
                    // Create a marker for each store
                    const storeMarker = new google.maps.Marker({
                        position: storeLocation,
                        map: map,
                        title: store.name
                    });
    
                    // Get store details to retrieve hours
                    const detailsRequest = {
                        placeId: store.place_id,
                        fields: ["name", "vicinity", "opening_hours", "website", "formatted_phone_number", "reviews"]
                    };
    
                    placesService.getDetails(detailsRequest, (placeDetails, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            const openingHours = placeDetails.opening_hours
                                ? placeDetails.opening_hours.weekday_text.join("<br>")
                                : "Hours not available";
    
                            const websiteButton = placeDetails.website
                                ? `<button class="store-website-button" onclick="window.open('${placeDetails.website}', '_blank')">Visit website</button>`
                                : "Website not available";

                            const phoneNumber = placeDetails.formatted_phone_number
                                ? placeDetails.formatted_phone_number
                                : "Phone number not available";        
                            
                            const reviews = placeDetails.reviews || []; // Get the reviews array
    
                            // Attach info window to the marker
                            const infoWindow = new google.maps.InfoWindow({
                                content: `<strong>${store.name}</strong><br>${store.vicinity}<br>Distance: ${distance} mi<br><strong>Hours:</strong><br>${openingHours}<br><button class="view-prices-button">View Prices</button><br><hr class="store-divider"><p class="store-phone">Call: <a href="tel:${phoneNumber}">${phoneNumber}</a></p><p class="store-website">${websiteButton}</p><button class="get-directions-button">Get directions</button><br><button class="view-reviews-button">What people say</button>`
                            });
                            
                            infoWindow.addListener("domready", () => {
                                const getDirectionsButton = document.querySelector(".get-directions-button");
                                getDirectionsButton.addEventListener("click", () => {
                                    const address = store.vicinity;
                                    const encodedAddress = encodeURIComponent(address);
                                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
                                    window.open(mapsUrl, "_blank");
                                });
                            });
                            
                            infoWindow.addListener("domready", () => {
                                const viewReviewsButton = document.querySelector(".view-reviews-button");
                                viewReviewsButton.addEventListener("click", () => {
                                    const reviewsContent = document.createElement("div");
                                    reviewsContent.classList.add("reviews-content"); // Add a class to the reviews content

                                    // Check if the reviews content is already visible
                                    if (infoWindow.getContent().includes("reviews-content")) {
                                        // If visible, remove the reviews content
                                        const content = infoWindow.getContent();
                                        const newContent = content.replace(/<div class="reviews-content">.*<\/div>/s, ""); // Remove the reviews content
                                        infoWindow.setContent(newContent);
                                    } else {
                                        // If not visible, create and append the reviews content
                                        reviewsContent.innerHTML = `<br><strong>Reviews:</strong><br>${reviews.map(review => `${review.rating} - ${review.text}`).join("<br>")}`;
                                        const content = infoWindow.getContent();
                                        const newContent = content.replace("</button>", "</button><br>"); // Add a line break before the reviews
                                        infoWindow.setContent(newContent + reviewsContent.outerHTML);
                                    }
                                });

                                const viewPricesButton = document.querySelector(".view-prices-button");
                                viewPricesButton.addEventListener("click", () => {
                                    fetch("static/google_sheet_download.json") // Replace with the actual path to your JSON file
                                    .then(response => response.json())
                                    .then(data => {
                                        const pricesData = data.filter(item => item["Shop"] && item["Zip Code"]);

                                        const storeData = pricesData.find(data => data["Shop"] === store.name);

                                        if (storeData) {
                                            const oilChangePrice = storeData["Oil Change"];
                                            const safetyInspectionPrice = storeData["Safety Inspection"];
                                            const emissionsInspectionPrice = storeData["Emissions Inspection\r"];

                                            // Create a pop-up to display the prices
                                            const popup = document.createElement("div");
                                            popup.classList.add("popup");

                                            const popupContent = document.createElement("div");
                                            popupContent.classList.add("popup-content");

                                            const closeButton = document.createElement("span");
                                            closeButton.classList.add("close-button");
                                            closeButton.innerHTML = "&times;";
                                            closeButton.addEventListener("click", () => {
                                                popup.style.display = "none";
                                            });

                                            const oilChangeField = document.createElement("p");
                                            oilChangeField.textContent = `Oil Change: ${oilChangePrice || "Price coming soon!"}`;

                                            const safetyInspectionField = document.createElement("p");
                                            safetyInspectionField.textContent = `Safety Inspection: ${safetyInspectionPrice || "Price coming soon!"}`;

                                            const emissionsInspectionField = document.createElement("p");
                                            emissionsInspectionField.textContent = `Emissions Inspection: ${emissionsInspectionPrice || "Price coming soon!"}`;

                                            popupContent.appendChild(closeButton);
                                            popupContent.appendChild(oilChangeField);
                                            popupContent.appendChild(safetyInspectionField);
                                            popupContent.appendChild(emissionsInspectionField);

                                            popup.appendChild(popupContent);

                                            document.body.appendChild(popup);

                                            popup.style.display = "block";
                                        } else {
                                            const popup = document.createElement("div");
                                            popup.classList.add("popup");

                                            const popupContent = document.createElement("div");
                                            popupContent.classList.add("popup-content");

                                            const closeButton = document.createElement("span");
                                            closeButton.classList.add("close-button");
                                            closeButton.innerHTML = "&times;";
                                            closeButton.addEventListener("click", () => {
                                                popup.style.display = "none";
                                            });

                                            const noDataField = document.createElement("p");
                                            noDataField.textContent = "Prices coming soon!";

                                            popupContent.appendChild(closeButton);
                                            popupContent.appendChild(noDataField);

                                            popup.appendChild(popupContent);

                                            document.body.appendChild(popup);

                                            popup.style.display = "block";
                                        }
                                    })
                                    .catch(error => {
                                        console.error("Error fetching prices:", error);
                                    });
                                });

                                // Add event listener to the "Get Directions" button
                                const getDirectionsButton = storeInfo.querySelector(".get-directions-button");
                                getDirectionsButton.addEventListener("click", () => {
                                    const address = store.vicinity;
                                    const encodedAddress = encodeURIComponent(address);
                                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
                                    window.open(mapsUrl, "_blank");
                                });

                            });
    
                            // Open the info window when marker is clicked
                            storeMarker.addListener("click", () => {
                                infoWindow.open(map, storeMarker);
                            });
    
                            // Append store info to the list
                            const storeCard = document.createElement("div");
                            storeCard.classList.add("store-card");

                            const storeInfo = document.createElement("div");
                            storeInfo.innerHTML = `
                                <div class="store-header">
                                    <p class="store-name">${store.name}</p>
                                    <button class="view-prices-button">View Prices</button>
                                </div>
                                <p class="store-address">${store.vicinity}</p>
                                <p class="store-distance">Distance: ${distance} mi</p>
                                <p class="store-opening-hours">${openingHours}</p>
                                <hr class="store-divider"> <!-- Add this line -->
                                <p class="store-phone">Call: <a href="tel:${phoneNumber}">${phoneNumber}</a></p>
                                <p class="store-website">${websiteButton}</p>
                                <button class="get-directions-button">Get directions</button> <!-- Add this line -->
                                <br>
                                <button class="view-reviews-button">What people say</button> <!-- Add this line -->            
                            `;

                           // Add event listener to the "View Reviews" button
                            const viewReviewsButton = storeInfo.querySelector(".view-reviews-button");
                            viewReviewsButton.addEventListener("click", () => {
                                const reviewsContent = document.createElement("div");
                                reviewsContent.classList.add("reviews-content"); // Add a class to the reviews content

                                // Check if the reviews content is already visible
                                if (storeInfo.querySelector(".reviews-content")) {
                                    // If visible, remove the reviews content
                                    storeInfo.removeChild(storeInfo.querySelector(".reviews-content"));
                                } else {
                                    // If not visible, create and append the reviews content
                                    reviewsContent.innerHTML = `<br><strong>Reviews:</strong><br>${reviews.map(review => `${review.rating} - ${review.text}`).join("<br>")}`;
                                    storeInfo.appendChild(reviewsContent);
                                }
                            });

                            // Add event listener to the phone number link
                            const phoneNumberLink = storeInfo.querySelector(".store-phone a");
                            phoneNumberLink.addEventListener("click", (event) => {
                                event.preventDefault();
                                const phoneNumber = phoneNumberLink.getAttribute("href").replace("tel:", "");
                                window.location.href = `tel:${phoneNumber}`;
                            });
                            // Add event listener to the "View Prices" button
                            const viewPricesButton = storeInfo.querySelector(".view-prices-button");
                            viewPricesButton.addEventListener("click", () => {
                                fetch("static/google_sheet_download.json") // Replace with the actual path to your JSON file
                                .then(response => response.json())
                                .then(data => {
                                    const pricesData = data.filter(item => item["Shop"] && item["Zip Code"]);

                                    const storeData = pricesData.find(data => data["Shop"] === store.name);

                                    if (storeData) {
                                        const oilChangePrice = storeData["Oil Change"];
                                        const safetyInspectionPrice = storeData["Safety Inspection"];
                                        const emissionsInspectionPrice = storeData["Emissions Inspection\r"];

                                        // Create a pop-up to display the prices
                                        const popup = document.createElement("div");
                                        popup.classList.add("popup");

                                        const popupContent = document.createElement("div");
                                        popupContent.classList.add("popup-content");

                                        const closeButton = document.createElement("span");
                                        closeButton.classList.add("close-button");
                                        closeButton.innerHTML = "&times;";
                                        closeButton.addEventListener("click", () => {
                                            popup.style.display = "none";
                                        });

                                        const oilChangeField = document.createElement("p");
                                        oilChangeField.textContent = `Oil Change: ${oilChangePrice || "Price coming soon!"}`;

                                        const safetyInspectionField = document.createElement("p");
                                        safetyInspectionField.textContent = `Safety Inspection: ${safetyInspectionPrice || "Price coming soon!"}`;

                                        const emissionsInspectionField = document.createElement("p");
                                        emissionsInspectionField.textContent = `Emissions Inspection: ${emissionsInspectionPrice || "Price coming soon!"}`;

                                        popupContent.appendChild(closeButton);
                                        popupContent.appendChild(oilChangeField);
                                        popupContent.appendChild(safetyInspectionField);
                                        popupContent.appendChild(emissionsInspectionField);

                                        popup.appendChild(popupContent);

                                        document.body.appendChild(popup);

                                        popup.style.display = "block";
                                    } else {
                                        const popup = document.createElement("div");
                                        popup.classList.add("popup");

                                        const popupContent = document.createElement("div");
                                        popupContent.classList.add("popup-content");

                                        const closeButton = document.createElement("span");
                                        closeButton.classList.add("close-button");
                                        closeButton.innerHTML = "&times;";
                                        closeButton.addEventListener("click", () => {
                                            popup.style.display = "none";
                                        });

                                        const noDataField = document.createElement("p");
                                        noDataField.textContent = "Prices coming soon!";

                                        popupContent.appendChild(closeButton);
                                        popupContent.appendChild(noDataField);

                                        popup.appendChild(popupContent);

                                        document.body.appendChild(popup);

                                        popup.style.display = "block";
                                    }
                                })
                                .catch(error => {
                                    console.error("Error fetching prices:", error);
                                });
                            });
    
                            // Add event listener to the "Get Directions" button
                            const getDirectionsButton = storeInfo.querySelector(".get-directions-button");
                            getDirectionsButton.addEventListener("click", () => {
                                const address = store.vicinity;
                                const encodedAddress = encodeURIComponent(address);
                                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
                                window.open(mapsUrl, "_blank");
                            });

                            storeCard.appendChild(storeInfo);
                            storesList.appendChild(storeCard);
                        } else {
                            console.error("Error fetching store details:", status);
                        }
                    });
                });
            } else {
                console.error("Error fetching nearby stores:", status);
            }
        });
    }

}

function loadMapScript() {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBHi9tYkUx45nIjN0F-UKgPi4XvQ1Y59Xg&libraries=places&callback=initMap`;
    script.defer = true;
    document.head.appendChild(script);
}

// Load the Google Maps API script
loadMapScript();