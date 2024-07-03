import { requestMsg } from '../../message'
import { httpFetch } from '../../request'
import { headers, timeout } from '../options'

const api_ikun = {
	getMusicUrl(songInfo, type) {
		const requestObj = httpFetch(`http://110.42.111.49:1314/url/tx/${songInfo.id}/${type}`, {
			method: 'get',
			timeout,
			headers,
			family: 4,
		})
		requestObj.promise = requestObj.promise.then(({ body }) => {
			console.log('body.code::'+JSON.stringify(body));
			return body.code === 0
				? Promise.resolve({ type, url: body.data })
				: Promise.reject(new Error(requestMsg.fail))
		})
		return requestObj.promise
	},
	getPic(songInfo) {
		return {
			promise: Promise.resolve(
				`https://y.gtimg.cn/music/photo_new/T002R500x500M000${songInfo.albumId}.jpg`,
			),
		}
	},
}

export default api_ikun
