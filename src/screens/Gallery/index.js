import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Easing,
  SafeAreaView,
  SafeAreaViewBase,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
const {width, height} = Dimensions.get('window');

import styles from './styles';
import {PEXELS_KEY} from '@env';

const API_URL =
  'https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=15';
const IMAGE_SIZE = 80;
const SPACING = 10;

const fetchImageFromPexels = async () => {
  const data = await fetch(API_URL, {
    headers: {
      Authorization: PEXELS_KEY,
    },
  });

  const {photos} = await data.json();

  return photos;
};

const Gallery = () => {
  const topRef = useRef();
  const thumbRef = useRef();
  const [images, setImages] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  console.log(activeIndex);

  useEffect(() => {
    const fetchImages = async () => {
      const images = await fetchImageFromPexels();
      setImages(images);
    };

    fetchImages();
  }, []);

  const scrollToActiveIndex = useCallback(index => {
    setActiveIndex(index);
    // scroll the flatlist
    topRef?.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });

    if (index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 3 > width / 2) {
      thumbRef.current.scrollToOffset({
        offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
        animated: true,
      });
    } else {
      thumbRef.current.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  }, []);

  if (!images) {
    return <Text>loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={topRef}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        data={images}
        keyExtractor={item => item.id.toString()}
        onMomentumScrollEnd={ev => {
          scrollToActiveIndex(
            Math.round(ev.nativeEvent.contentOffset.x / width),
          );
        }}
        renderItem={({item}) => {
          return (
            <View style={{width, height, backgroundColor: 'white'}}>
              <Image
                source={{uri: item.src.portrait}}
                style={[styles.absoluteFillObject]}
              />
            </View>
          );
        }}
      />

      <FlatList
        ref={thumbRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={images}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{paddingHorizontal: SPACING}}
        style={{position: 'absolute', bottom: IMAGE_SIZE}}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity onPress={() => scrollToActiveIndex(index)}>
              <Image
                source={{uri: item.src.portrait}}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: 12,
                  marginRight: SPACING,
                  borderWidth: 2,
                  borderColor: index === activeIndex ? '#fff' : 'transparent',
                }}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default Gallery;
