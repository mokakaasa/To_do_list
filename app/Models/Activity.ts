import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Activity extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  declare activity: string 

  @column()
  declare status_id: number

  @column()
  declare is_archieved: number

  @column()
  declare is_paused: number

  @column()
  declare is_deleted: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
