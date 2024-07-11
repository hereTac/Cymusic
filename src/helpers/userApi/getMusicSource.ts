
import { httpFetch } from '@/components/utils/request';
import { headers, timeout } from '@/components/utils/musicSdk/options.js';
import { fakeAudioMp3Uri } from '@/constants/images';
import axios from 'axios'
import { b64DecodeUnicode, decodeName } from '@/components/utils'

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), ms)
  );
  return Promise.race([promise, timeout]);
};
const fetchWithTimeout = (url, options, timeout = 5000) => {
  console.log('----start----'+url);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, timeout);

    fetch(url, options)
      .then(response => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
};
export const myGetMusicUrl = (songInfo, type) => {
  const url = `http://110.42.111.49:1314/url/tx/${songInfo.id}/${type}`;
  const backupUrl = `https://ovoa.cc/api/QQmusic.php?msg=${encodeURIComponent(songInfo.title)}&&n=1`;

const options = {
  method: 'GET',
  headers: headers,  // Define your headers object
  family: 4,
  credentials: 'include',  // withCredentials: true equivalent in fetch
};
return fetchWithTimeout(url, options, 5000)
  .then((response: Response) => parseResponse(response))
  .then((body: any) => {
    if (!body.data || (typeof body.data === 'string' && body.data.includes('error'))) {
      console.log('Fetch1 failed with error mp3');
       return fetchWithTimeout(backupUrl, options, 5000)
            .then((backupResponse: Response) => parseResponse(backupResponse))
            .then((backupBody: any) => {
              if (!backupBody || !backupBody.data || !backupBody.data.src) {
                console.log('Backup fetch failed or no song_url in response');
                return { type, url: fakeAudioMp3Uri };
              }
              console.log('Backup fetch success:', backupBody.data.src);
              return { type, url: backupBody.data.src };
            })
            .catch((backupError: Error) => {
              console.log('Backup fetch error:', backupError);
              return { type, url: fakeAudioMp3Uri };
            });
    }
    console.log('获取成功1：' + body.data);
    return body.code === 0 ? { type, url: body.data } : null;
  })
  .catch((error: Error) => {
    if (error.message === 'Request timed out') {
      console.log('Fetch1 error: Request timed out');
           return fetchWithTimeout(backupUrl, options, 5000)
            .then((backupResponse: Response) => parseResponse(backupResponse))
            .then((backupBody: any) => {
              if (!backupBody || !backupBody.data || !backupBody.data.src) {
                console.log('Backup fetch failed or no song_url in response');
                return { type, url: fakeAudioMp3Uri };
              }
              console.log('Backup fetch success:', backupBody.data.src);
              return { type, url: backupBody.data.src };
            })
            .catch((backupError: Error) => {
              console.log('Backup fetch error:', backupError);
              return { type, url: fakeAudioMp3Uri };
            });
    }
    console.log('Fetch1 error:', error);
         return fetchWithTimeout(backupUrl, options, 5000)
            .then((backupResponse: Response) => parseResponse(backupResponse))
            .then((backupBody: any) => {
              if (!backupBody || !backupBody.data || !backupBody.data.src) {
                console.log('Backup fetch failed or no song_url in response');
                return { type, url: fakeAudioMp3Uri };
              }
              console.log('Backup fetch success:', backupBody.data.src);
              return { type, url: backupBody.data.src };
            })
            .catch((backupError: Error) => {
              console.log('Backup fetch error:', backupError);
              return { type, url: fakeAudioMp3Uri };
            });
  });
	// return  Promise.resolve({ type, url: fakeAudioMp3Uri })
  // const fetch1 = withTimeout(httpFetch(`http://110.42.111.49:1314/url/tx/${songInfo.id}/${type}`, {
  //   method: 'get',
  //   timeout,
  //   headers,
  //   family: 4,
  //   xsrfCookieName: "XSRF-TOKEN",
  //   withCredentials: true,
  // }).promise.then(({ body }) => {
  //
  //   if (!body.data || (typeof body.data === 'string' && body.data.includes('error'))) {
  //     console.log('Fetch1 failed with error mp3');
  //     return null;
  //   }
  //   console.log('获取成功1：' + body.data);
  //   return body.code === 0 ? { type, url: body.data } : null;
  // }).catch(error => {
  //   console.log('Fetch1 error:', error);
  //   return null;
  // }), 5000);

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

  // const raceToNonNull = (promises) => {
  //   return Promise.race(promises).then(result => {
  //     if (result === null) {
  //       const index = promises.indexOf(Promise.resolve(result));
  //       if (index > -1) {
  //         promises.splice(index, 1);
  //       }
  //       if (promises.length > 0) {
  //         return raceToNonNull(promises);
  //       } else {
  //         return { type, url: fakeAudioMp3Uri };
  //       }
  //     }
  //     return result;
  //   });
  // };
  //
  // return raceToNonNull([fetch1]);
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
export const  myGetLyric = async (musicItem:IMusic.IMusicItem) => {
  try {
      const requestObj = httpFetch(`https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=${musicItem.id}&g_tk=5381&loginUin=0&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&platform=yqq`, {
      headers: {
        Referer: 'https://y.qq.com/portal/player.html',
      },
    });

    const { body } = await requestObj.promise;
    // console.log(body.code ,body.lyric);
    if (body.code !== 0 || !body.lyric) {
      throw new Error('Get lyric failed');
    }

    return {
      lyric: decodeName(b64DecodeUnicode(body.lyric)),
      tlyric: decodeName(b64DecodeUnicode(body.trans)),
    };

  } catch (error) {
    console.error('Error fetching lyrics:', error);
    throw error;
  }
}
export async function getTopListDetail(topListItem) {
  let _a
  const res = await  axios({
        url: `https://u.y.qq.com/cgi-bin/musicu.fcg?g_tk=5381&data=%7B%22detail%22%3A%7B%22module%22%3A%22musicToplist.ToplistInfoServer%22%2C%22method%22%3A%22GetDetail%22%2C%22param%22%3A%7B%22topId%22%3A${topListItem.id}%2C%22offset%22%3A0%2C%22num%22%3A100%2C%22period%22%3A%22${(_a = topListItem.period) !== null && _a !== void 0 ? _a : ""}%22%7D%7D%2C%22comm%22%3A%7B%22ct%22%3A24%2C%22cv%22%3A0%7D%7D`,
        method: "get",
        headers: {
            Cookie: "uin=",
        },
        xsrfCookieName: "XSRF-TOKEN",
        withCredentials: true,
    });
    return Object.assign(Object.assign({}, topListItem), {
        musicList: res.data.detail.data.songInfoList
            .map(formatMusicItem)
    });
}
function formatMusicItem(_) {
    let _a, _b, _c;
    const albumid = _.albumid || ((_a = _.album) === null || _a === void 0 ? void 0 : _a.id);
    const albummid = _.albummid || ((_b = _.album) === null || _b === void 0 ? void 0 : _b.mid);
    const albumname = _.albumname || ((_c = _.album) === null || _c === void 0 ? void 0 : _c.title);
    return {
        id: _.mid || _.songid,
        songmid: _.id || _.songmid,
        title: _.title || _.songname,
        artist: _.singer.map((s) => s.name).join(", "),
        artwork: albummid
            ? `https://y.gtimg.cn/music/photo_new/T002R800x800M000${albummid}.jpg`
            : undefined,
        album: albumname,
        lrc: _.lyric || undefined,
        albumid: albumid,
        albummid: albummid,
        url: 'Unknown',
    };
}
export async function getTopLists() {
    const list = await  axios({
        url: "https://u.y.qq.com/cgi-bin/musicu.fcg?_=1577086820633&data=%7B%22comm%22%3A%7B%22g_tk%22%3A5381%2C%22uin%22%3A123456%2C%22format%22%3A%22json%22%2C%22inCharset%22%3A%22utf-8%22%2C%22outCharset%22%3A%22utf-8%22%2C%22notice%22%3A0%2C%22platform%22%3A%22h5%22%2C%22needNewCode%22%3A1%2C%22ct%22%3A23%2C%22cv%22%3A0%7D%2C%22topList%22%3A%7B%22module%22%3A%22musicToplist.ToplistInfoServer%22%2C%22method%22%3A%22GetAll%22%2C%22param%22%3A%7B%7D%7D%7D",
        method: "get",
        headers: {
            Cookie: "uin=",
        },
        xsrfCookieName: "XSRF-TOKEN",
        withCredentials: true,
    });
    return list.data.topList.data.group.map((e) => ({
        title: e.groupName,
        data: e.toplist.map((_) => ({
            id: _.topId,
            description: _.intro,
            title: _.title,
            period: _.period,
            coverImg: _.headPicUrl || _.frontPicUrl,
        })),
    }));
}