import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Activity from 'App/Models/Activity';
import { DateTime } from 'luxon';

  
  export default class ActivitiesController {
    public async index({ request, inertia }: HttpContextContract) {
      const search = request.input('search', '').toLowerCase()
  
      // Search activities based on the 'activity' field
      const activities = await Activity.query()
        .if(search, (query) => {
          query.where('Activity', 'like', `%${search}%`)
        })
        .orderBy('created_at', 'desc')
  
      return inertia.render('Index', { activities, search })
    }
  
  
  
  public async create({ inertia}: HttpContextContract) {
    return inertia.render('Home')
  }

  public async store({ request, response }: HttpContextContract) {
    // Extract tasks and status_id from the request
    const data = request.only(['tasks', 'status_id']);
  
    // Split the tasks string by spaces, trimming each task and filtering out empty entries
    const taskLines = data.tasks;
  
    // Extract the status_ids
    const statusIds = data.status_id;
  
    // Check if the number of tasks matches the number of status_ids
    if (taskLines.length !== statusIds.length) {
      return response.badRequest({ error: "The number of tasks must match the number of status_ids." });
    }
  
    // Iterate through taskLines and statusIds in sync
    for (let i = 0; i < taskLines.length; i++) {
      const statusId = statusIds[i]; // Get the corresponding status_id for the task
  
      // Create the activity for each task with its corresponding status_id
      const activity= await Activity.create({
        activity: taskLines[i],   // Task at index i
        status_id: statusId,      // Status at the same index i
      });
      await activity.save();
    }
  
    // Redirect back after processing
    return response.redirect('/today');
  }
  public async today({ inertia }: HttpContextContract) {
    const today = DateTime.local().toISODate(); // Get today's date in ISO format (YYYY-MM-DD)

    // Fetch activities where the `createdAt` date is equal to today
    const activities = await Activity.query()
        .whereRaw('DATE(created_at) = ?', [today]); // assuming your DB uses 'created_at' for timestamp

    return inertia.render('Today', { activities });
}


public async todayupdate({ request, response }: HttpContextContract) {
  // Extract status_id and the activity_id (assuming it's passed)
  const data = request.only(['statusId', 'activityId']);

  // Fetch the activity by its ID
  const activity = await Activity.find(data.activityId);
  
  if (!activity) {
    return response.status(404).json({ message: 'Activity not found' });
  }

  // Update the activity's status_id
  activity.status_id = data.statusId;
  
  // Save the changes to the database
  await activity.save();

  // Return a success message with the updated activity
  return response.json({ message: 'CHANGES HAVE BEEN SUBMITTED', activity });
}

public async completed({view}: HttpContextContract) {
  const activities = await Activity.query().where('status_id', 1);
  return view.render('completed',{ activities })
}

public async pending({view}: HttpContextContract) {
  const activities = await Activity.query().where('status_id', 2);
  return view.render('pending',{ activities })
}

public async paused({view}: HttpContextContract) {
  const activities = await Activity.query().where('status_id', 4);
  return view.render('paused',{ activities })
}

public async archieved({view}: HttpContextContract) {
  const activities = await Activity.query().where('is_archieved', 1);
  return view.render('archieved',{ activities })
}
  public async show({view,response,params}: HttpContextContract) {
  
      const activityId = params.id
  
      // Simulate fetching the activity from a database
      const activity = await Activity.find(activityId);
      console.log('Fetched Activity:', activity)
  
      if (activity) {
        const statusId = activity.status_id;
          
         if (activity.is_archieved === 1) {
          return view.render('viewPageForArchieved',{activity});
        }
      
   
          if (statusId === 1) {
            return view.render('viewPageForCompleted',{activity})
             
          } else if (statusId === 2) {
            return view.render('viewPageForPending',{activity});
          } 
          else if (statusId === 4) {
            return view.render('viewPageForPaused',{activity});
          }
          else {
              response.send('Unknown status');
          }
      } else {
          response.status(404).send('Activity not found');
      }
  }
  public async details({ params,inertia}: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);

    // Return the activity to be edited
    return inertia.render('Details', { activity});
}
  public async edit({ params,inertia}: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);

    // Return the activity to be edited
    return inertia.render('Edit', { activity},);
}

public async update({ request, params, response}: HttpContextContract) {

    const data = request.only(['tasks', 'status_id']); // Get the updated task and status
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);
    
    if (!activity) {
        return response.status(404).json({ message: 'Task not found' });
    }

    // Update the task and status
    activity.activity = data.tasks;
    activity.status_id = data.status_id;

    // Save the changes
    await activity.save();

    return response.json({
      message: 'Activity updated successfully!',
      redirectUrl: `/show/${activity.id}` // Include the redirect URL in the JSON response
  });
  
}
public async archieve({ params, response }: HttpContextContract) {
  const activityId = params.id;

  // Find the activity by its ID
  const activity = await Activity.find(activityId);

  if (!activity) {
    return response.status(404).json({ message: 'Activity not found' });
  }

  // Update the status of the activity to 'archived'
  activity.is_archieved = 1;


  // Save the updated activity to the database
  await activity.save();

  // Return a success message
  return response.json({ message: 'Activity ARCHIEVED', activity });
}


public async pause({ params, response }: HttpContextContract) {
  const activityId = params.id;

  // Find the activity by its ID
  const activity = await Activity.find(activityId);

  if (!activity) {
    return response.status(404).json({ message: 'Activity not found' });
  }

  // Update the status of the activity to 'paused' (status_id = 4)
  activity.status_id = 4;

  // Prevent updating the 'updatedAt' field
  activity.$attributes.updatedAt = activity.updatedAt;

  // Get the current time
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();

  // Log the full current time
  console.log(`Current Time: ${currentHour}:${currentMinute}`);

  // Check if the current time is past midnight (00:01)
  // if (currentHour === 0 && currentMinute === 0) {
  //   activity.is_archieved = 1;
  // }
  
  if (currentHour === 0 && currentMinute >= 1) {
    // Change is_archieved to true (1) if it's past 00:01
    activity.is_archieved = 1;
  }

  // Save the updated activity to the database
  await activity.save();

  // Return a success message
  return response.json({ message: 'Activity PAUSED', activity });
}


public async review({ params, inertia }: HttpContextContract) {
  const activityId = params.id;

  // Find the activity by ID
  const activity = await Activity.find(activityId);

  if (activity) {

    activity.is_archieved= 0;

    // Check if the original status_id was 1
    if (activity.status_id === 1) {
      return inertia.render('Review', { activity });
    } else {
      return inertia.render('View', { activity });
    }
  }

  // Handle if the activity is not found
  return inertia.render('Error', { message: 'Activity not found' });
}


public async restart({ request, params, response }: HttpContextContract) {
  const data = request.only(['status_id']); // Get status_id from request
  const activityId = params.id;

  // Find the activity by ID
  const activity = await Activity.find(activityId);

  if (!activity) {
    return response.status(404).json({ message: 'Activity not found' });
  }

  // Update the activity's status_id
  activity.status_id = data.status_id;
  activity.is_archieved = 0;

  // Save the changes to the database
  await activity.save();

  return response.json({
    message: 'ACTIVITY IS NO LONGER ARCHIEVED',
    redirectUrl: `/show/${activity.id}` // Include the redirect URL in the response
  });
}

public async view({ params, inertia }: HttpContextContract) {
  const activityId = params.id;

  // Find the activity by ID
  const activity = await Activity.find(activityId);

  if (activity) {


    activity.is_archieved= 0;
    // Check if the original status_id was 1
    if (activity.status_id === 2) {
      return inertia.render('View', { activity });
    } else {
      return inertia.render('Review', { activity });
    }
  }

  // Handle if the activity is not found
  return inertia.render('Error', { message: 'Activity not found' });
}

 

public async revive({ request, params, response }: HttpContextContract) {
  const data = request.only(['status_id']); // Get status_id from request
  const activityId = params.id;
  


  // Find the activity by ID
  const activity = await Activity.find(activityId);
 

  if (!activity) {
    return response.status(404).json({ message: 'Activity not found' });
  }

  // Update the activity's status_id
  activity.status_id = data.status_id;
  activity.is_archieved = 0;

  // Save the changes to the database
  await activity.save();

  return response.json({
    message: 'ACTIVITY IS NO LONGER ARCHIEVED',
    redirectUrl: `/show/${activity.id}` // Include the redirect URL in the response
  });
}

  public async destroy({}: HttpContextContract) {}
}
