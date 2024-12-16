import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.text('activity','longtext').notNullable()
      table.integer('status_id').unsigned().references('id').inTable('statuses')
      table.integer('is_archieved').unsigned().defaultTo(0)
      table.integer('is_paused').unsigned().defaultTo(0)
      table.integer('is_deleted').unsigned().defaultTo(0)
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
