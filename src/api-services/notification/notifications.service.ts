import { HttpException, Injectable } from '@nestjs/common';
import { InjectFirebaseAdmin, FirebaseAdmin } from 'nestjs-firebase';
import { Message } from 'firebase-admin/messaging';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}

  public async sendNotification(message: Message) {
    try {
      const msg = await this.firebase.messaging.send(message);
      console.log(msg);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.message ?? 'SOMETHING WENT WRONG',
        error.status ?? 500,
      );
    }
  }

  public async sendNotificationToAll() {}

  public async sendNotificationToMulticast() {}

  public async sendNotificationByCondition() {}

  public async sendNotificationToDevice() {}

  public async sendNotificationToDeviceGroup() {}

  public async sendNotificationByTopic() {}

  public async subscribeToTopic() {}

  public async unsubscribeFromTopic() {}
}
