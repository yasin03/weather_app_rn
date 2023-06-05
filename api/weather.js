import axios from 'axios';
const key = process.env.API_KEY;

const forecastEndpoints = params =>
  `https://api.weatherapi.com/v1/forecast.json?key=ecf700bdb56546df9cc120424230106&q=${params.cityName}&days=${params.days}`;

const locationsEndpoints = params =>
  `https://api.weatherapi.com/v1/search.json?key=ecf700bdb56546df9cc120424230106&q=${params.cityName}`;

const apiCall = async endpoint => {
  const options = {
    method: 'GET',
    url: endpoint,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchWeatherForecast = params => {
  return apiCall(forecastEndpoints(params));
};
export const fetchLocations = params => {
  return apiCall(locationsEndpoints(params));
};
