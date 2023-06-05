import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import BGimage from '../../../assets/img/bg2.jpg';
import {theme} from '../../theme';
import {debounce} from 'lodash';
import {fetchLocations, fetchWeatherForecast} from '../../../api/weather';
import {getData, storeData} from '../../../utils/asyncStorage';
const Home = () => {
  const [showSearch, toggleShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState();
  const [currrentDate, setCurrentDate] = useState();

  const handleLocation = location => {
    setLocations([]);
    toggleShowSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: location.name,
      days: '7',
    }).then(result => {
      toggleShowSearch(false);
      setWeather(result);
      setLoading(false);
      storeData('city', location.name);
    });
  };

  const handleSearch = search => {
    if (search && search.length > 2)
      fetchLocations({cityName: search}).then(data => {
        setLocations(data);
      });
  };

  useEffect(() => {
    fetchMyWeather();
    let tm = new Date();
    tm = tm.getHours();
    setCurrentTime(tm);

    const now = new Date();
    setCurrentDate(formatDate(now));
  }, []);

  const fetchMyWeather = async () => {
    let myCity = await getData('city');
    let cityName = 'Istanbul';
    if (myCity) cityName = myCity;
    setLoading(true);
    fetchWeatherForecast({
      cityName,
      days: '7',
    }).then(result => {
      toggleShowSearch(false);
      setWeather(result);
      setLoading(false);
    });
  };

  function formatDate(date) {
    const options = {
      day: 'numeric',
      month: 'long',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    };
    const fDate = date.toLocaleString('en-US', options);
    return fDate;
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const {current, location} = weather;

  return (
    <View className="flex-1 relative">
      <Image
        source={BGimage}
        blurRadius={30}
        className="absolute w-full h-full"
      />
      {loading ? (
        <View className="flex-1 items-center justify-center ">
          <Text className="text-white text-4xl font-bold">Loading...</Text>
        </View>
      ) : (
        <SafeAreaView className="flex flex-1 mx-4">
          {/* Search Section */}
          <View style={{height: '7%'}} className=" mt-2 relative z-50">
            <View
              className="flex-row justify-end items-center rounded-full"
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : 'transparent',
              }}>
              {showSearch && (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor={'lightgray'}
                  className="pl-6 h-10 flex-1 text-base text-white
                "
                />
              )}

              <TouchableOpacity
                onPress={() => toggleShowSearch(!showSearch)}
                className="rounded-full h-11 p-3 m-1"
                style={{backgroundColor: theme.bgWhite(0.3)}}>
                <Icon name={'search'} size={20} color={'white'} />
              </TouchableOpacity>
            </View>
          </View>
          {/* Search Section Dropbox */}
          {showSearch ? (
            <View className="absolute top-20 w-full rounded-3xl bg-gray-300 ">
              {locations.map((loc, index) => {
                let showBorder = index + 1 != locations.length;
                let borderClass = showBorder
                  ? ' border-b border-b-slate-400'
                  : '';
                return (
                  <TouchableOpacity
                    onPress={() => handleLocation(loc)}
                    key={index}
                    className={
                      'flex-row gap-2 items-center p-3 px-4 mb-1' + borderClass
                    }>
                    <Icon name="location-arrow" size={20} />
                    <Text className="text-xl text-black ml-2">
                      {loc?.name}, {loc?.country}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {/* ForeCast Area */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className=" flex justify-around flex-1 gap-4">
              <View>
                <Text className="text-2xl text-white font-semibold text-center">
                  {location?.name},
                  <Text className="text-xl text-white font-normal">
                    {location?.country}
                  </Text>
                </Text>
                <Text className="text-white text-center">{currrentDate}</Text>
              </View>

              {/* Weather Image */}
              <View className="flex-row justify-center">
                <Image
                  source={{uri: 'https:' + current?.condition?.icon}}
                  className="w-48 h-48"
                />
              </View>

              {/* info Area */}
              <View className="mx-4 flex justify-center items-center my-6">
                <Text className="text-center font-bold text-6xl text-white ml-5">
                  {current?.temp_c}&#176;
                </Text>
                <Text className="text-center text-xl text-white tracking-widest">
                  {current?.condition.text}
                </Text>
              </View>

              {/* Other Status */}
              <View className="flex-row justify-evenly items-center my-6">
                <View className=" flex-row space-x-2 items-center">
                  <Image
                    source={require('../../../assets/icons/wind.png')}
                    className="w-6 h-6"
                  />
                  <Text className="text-white">{current?.wind_kph}km</Text>
                </View>
                <View className=" flex-row space-x-2 items-center">
                  <Image
                    source={require('../../../assets/icons/drop.png')}
                    className="w-6 h-6"
                  />
                  <Text className="text-white text-base">
                    {current?.humidity}%
                  </Text>
                </View>
                <View className=" flex-row space-x-2 items-center">
                  <Image
                    source={require('../../../assets/icons/sun.png')}
                    className="w-6 h-6"
                  />
                  <Text className="text-white">
                    {weather?.forecast?.forecastday[0].astro?.sunrise}
                  </Text>
                </View>
              </View>

              {/* Forecast NextDays */}
              <View className="space-y-8 ">
                <View>
                  <View className="flex-row justify-center space-x-2 items-center mb-4">
                    <Icon name="calendar" size={16} color="white" />
                    <Text className="text-white">Hourly Forecast</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{backgroundColor: theme.bgWhite(0.15)}}
                    className=" rounded-xl px-3 w-full">
                    {weather?.forecast?.forecastday[0]?.hour?.map(
                      (item, index) => {
                        let tm = new Date(item.time);
                        let time = tm.toString();
                        time = time.substring(16, 21);
                        const crTime = parseInt(time.split(':')[0]);

                        if (crTime >= currentTime) {
                          return (
                            <View
                              key={index}
                              className="flex-column items-center justify-center p-3 w-22">
                              <Image
                                source={{uri: 'https:' + item?.condition?.icon}}
                                /* source={weatherImages[item?.day?.condition?.text || 'other']} */
                                className="w-11 h-11"
                              />
                              <Text className="text-white">
                                {crTime == currentTime ? 'Now' : time}
                              </Text>
                              <Text className="text-center font-bold text-xl text-white">
                                {item?.temp_c}&#176;
                              </Text>
                            </View>
                          );
                        }
                      },
                    )}
                  </ScrollView>
                </View>
                <View>
                  <View className="flex-row justify-center space-x-2 items-center mb-4">
                    <Icon name="calendar" size={16} color="white" />
                    <Text className="text-white">Daily Forecast</Text>
                  </View>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {weather?.forecast?.forecastday?.map((item, index) => {
                      let date = new Date(item.date);
                      let options = {weekday: 'long'};
                      let dateDay = date.toLocaleDateString('en-US', options);
                      dateDay = dateDay.split(',')[0];

                      return (
                        <View
                          key={index}
                          style={{backgroundColor: theme.bgWhite(0.15)}}
                          className="flex-row items-center justify-between rounded-xl p-3 w-full mb-3 relative">
                          <Text className="text-white text-lg">{dateDay}</Text>
                          <Text className="text-white text-lg absolute left-32">
                            <Image
                              source={require('../../../assets/icons/drop.png')}
                              className="w-4 h-4"
                            />{' '}
                            {item?.day?.avghumidity}%
                          </Text>
                          <Image
                            source={{
                              uri: 'https:' + item?.day?.condition?.icon,
                            }}
                            /* source={weatherImages[item?.day?.condition?.text || 'other']} */
                            className="w-12 h-12 absolute left-48"
                          />

                          <Text className="text-lg text-white ">
                            {item?.day?.mintemp_c}&#176; /{' '}
                            {item?.day?.maxtemp_c}&#176;
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
};

export default Home;
