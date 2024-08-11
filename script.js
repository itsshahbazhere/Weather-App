const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");


//initially variable need??

let currentTab = userTab;
const API_KEY = "76b697533322af6a987fc6468c92f0be";

currentTab.classList.add("current-tab");
getFromSeasonstorage();

function switchTab(clickedTab){ //clickedTab either userTab or serchTab
    if(clickedTab != currentTab){
        //changing background color
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //you are in weather tab.....then display weather ...check local storage first
            //for co-ordinates, if we have saved them there
            getFromSeasonstorage();

        }

    }
    
}

userTab.addEventListener('click', ()=> {
    switchTab(userTab);
});

searchTab.addEventListener('click', ()=> {
    switchTab(searchTab);
});


//check if cordinates are already present in session storage
function getFromSeasonstorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //agar local coordinates nahi hai
        grantAccessContainer.classList.add('active');
    }
    else{
        const coordinates = JSON.parse(localCoordinates); //json string json object
        fetchUserWeatherInfo(coordinates);
    }
}


async function fetchUserWeatherInfo(coordinates){
    const {lat,  lon} = coordinates;

    //make grant container invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API call
    try{
        const responce = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await responce.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");//hw
    }
}

function renderWeatherInfo(weatherInfo){

    //first we have fetch the element
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countyIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-wetherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch value from weatherInfo object and put it ui elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;   
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;

    
}

const grantAccessBtn = document.querySelector("[data-grantAccess]");
grantAccessBtn.addEventListener('click',getlocation);

function getlocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position){
    const userCoordinate = {
        lat : position.coords.latitude,
        lon : position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinate));
    fetchUserWeatherInfo(userCoordinate);

}


const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (err)=>{
    err.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;

    else{
        fetchSearchWeatherInfo(cityName);
    }

    cityName = "";

});


async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const responce = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await responce.json();
        loadingScreen.classList.remove("active");
        if(responce.ok){ //city is found then render the weather info
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
        else{
            throw new Error;
        }
        
    }
    catch(err){


        loadingScreen.classList.remove("active");
        // Display alert message
        alert("City not found. Please check the city name and try again.");
    }
}

