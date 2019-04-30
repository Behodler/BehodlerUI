
import { Observable } from 'rxjs'

export async function LockSubscription(subscription:any, action: (observer) => void): Promise<Observable<any>> {
	let lock:boolean = false;
	return await Observable.create((observer) => {
		subscription.on('data', async () => {
			if (lock)
				return;
			lock = true
			await action(observer)
			lock = false
		})
	})
}