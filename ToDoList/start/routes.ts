/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {

Route.get('/', 'ToDoListsController.index')

Route.get('/create', 'ToDoListsController.create')

Route.post('/store', 'ToDoListsController.store')

Route.get('/today', 'ToDoListsController.today')

Route.post('/todayupdate', 'ToDoListsController.todayupdate')

Route.get('/completed', 'ToDoListsController.completed')

Route.get('/pending', 'ToDoListsController.pending')

Route.get('/pause', 'ToDoListsController.paused')

Route.get('/archieve', 'ToDoListsController.archieved')

Route.get('/show/:id', 'ToDoListsController.show')

Route.get('/detail/:id', 'ToDoListsController.details');

Route.get('/edit/:id', 'ToDoListsController.edit');

Route.post('/update/:id', 'ToDoListsController.update');

Route.get('/archieve/:id', 'ToDoListsController.archieve');

Route.get('/view/:id', 'ToDoListsController.view');

Route.post('/revive/:id', 'ToDoListsController.revive')

Route.get('/review/:id', 'ToDoListsController.review');

Route.post('/restart/:id', 'ToDoListsController.restart')

Route.get('/pause/:id', 'ToDoListsController.pause')

Route.post('/delete/:id', 'ToDoListsController.destroy')
})

