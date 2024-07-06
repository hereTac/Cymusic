import { requestMsg } from '@/components/utils/message';
import { httpFetch } from '@/components/utils/request';
import { headers, timeout } from '@/components/utils/musicSdk/options.js';
import { getMediaSource } from '@/helpers/userApi/xiaoqiu';
import { fakeAudioMp3Uri } from '@/constants/images';

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), ms)
  );
  return Promise.race([promise, timeout]);
};

export const myGetMusicUrl = (songInfo, type) => {
  const fetch1 = withTimeout(httpFetch(`http://110.42.111.49:1314/url/tx/${songInfo.id}/${type}`, {
    method: 'get',
    timeout,
    headers,
    family: 4,
  }).promise.then(({ body }) => {
    if (!body.data || (typeof body.data === 'string' && body.data.includes('error'))) {
      console.log('Fetch1 failed with error mp3');
      return null;
    }
    console.log('获取成功1：' + body.data);
    return body.code === 0 ? { type, url: body.data } : null;
  }).catch(error => {
    console.log('Fetch1 error:', error);
    return null;
  }), timeout);

  // const fetch2 = withTimeout(getMediaSource(songInfo, '128k').then((resp) => {
  //   if (!resp) {
  //     console.log('Fetch2 failed');
  //     return null;
  //   }
  //   console.log('获取成功2：' + resp.url);
  //   return { type, url: resp.url };
  // }).catch(error => {
  //   console.log('Fetch2 error:', error);
  //   return null;
  // }), timeout);
  //
  // const fetch3 = withTimeout(fetch(`http://97.64.37.235/flower/v1/url/tx/${songInfo.id}/${type}`, {
  //   method: 'GET',
  //   headers: {
  //     'accept': '*/*',
  //     'user-agent': 'lx-music/desktop',
  //     'ver': '2.0.0',
  //     'source-ver': '1',
  //     'tag': '5b0a202230303279222c0a20223045222c0a20223132386b220a5d',
  //     'host': '97.64.37.235',
  //     'Connection': 'close'
  //   }
  // }).then(parseResponse)
  // .then(data => {
  //   if (!data || !data.url) {
  //     console.log('Fetch3 failed:'+data);
  //     return null;
  //   }
  //   console.log('获取成功3：' + data);
  //   return { type, url: data.url };
  // })
  // .catch(error => {
  //   console.log('Fetch3 error:', error);
  //   return null;
  // }), timeout);

  const raceToNonNull = (promises) => {
    return Promise.race(promises).then(result => {
      if (result === null) {
        const index = promises.indexOf(Promise.resolve(result));
        if (index > -1) {
          promises.splice(index, 1);
        }
        if (promises.length > 0) {
          return raceToNonNull(promises);
        } else {
          return { type, url: fakeAudioMp3Uri };
        }
      }
      return result;
    });
  };

  return raceToNonNull([fetch1]);
};
const parseResponse = async (response) => {
  try {
    return await response.json();
  } catch (e) {
    try {
      if(response.status==404){
        return '404'

      }
      return await response.text();
    } catch (e) {
      console.log('Failed to parse response');
    }
  }
};
