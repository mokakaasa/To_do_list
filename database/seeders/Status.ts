import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Statuses from 'App/enums/statuses'
import Status from 'App/Models/Status'

export default class extends BaseSeeder {

  static environment = ['development','testing']

  async run() {
    // Write your database queries inside the run method
    await Status.createMany([
      {id:Statuses.COMPLETED,status_name:'completed'},
      {id:Statuses.PENDING,status_name:'pending'},
    ])
  }
}
