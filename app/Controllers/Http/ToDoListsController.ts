import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Activity from "App/Models/Activity";
import { schema, rules } from '@ioc:Adonis/Core/Validator';
// import { inertia } from "Config/inertia";
import { DateTime } from "luxon";

export default class ActivitiesController {
  public async index({ request, inertia }: HttpContextContract) {
    const search = request.input("search", "").toLowerCase();

    const pagination= request.only(["page","itemsPerPage"]);
    const page =pagination.page || 1;
    const itemsPerPage =pagination.itemsPerPage || 15;

    // Fetch activities excluding those marked as deleted
    const activities = await Activity.query()
      .if(search, (query) => {
        query.where("activity", "like", `%${search}%`);
      })
      .orderBy("created_at", "desc")
      .paginate(page,itemsPerPage);
      

    // const metricpretime = activities.map(activity => activity.createdAt.toFormat("yyyy-MM-dd'T'HH:mm:ss"));

    // const metricposttime = activities.map(activity => activity.updatedAt.toFormat("yyyy-MM-dd'T'HH:mm:ss"));

    return inertia.render("Index", { activities, search});
  }

  public async searchall({ request, response }: HttpContextContract) {
    const search = request.input('search', '').toLowerCase();
    const page = request.input('page', 1); // Current page, default is 1
    const itemsPerPage = request.input('itemsPerPage', 15); // Items per page, default is 15
    const allPages = request.input('allPages', false); // Flag to fetch all pages

    
      // Query for activities with optional search filter
      const query = Activity.query()
        .if(search, (query) => {
          query.where('activity', 'like', `%${search}%`);
        })
        .orderBy('created_at', 'desc');

      let activities;

      if (allPages) {
        // Fetch all matching activities without pagination
        activities = await query.exec();
        return response.json({ data: activities });
      } else {
        // Paginate the query
        activities = await query.paginate(page, itemsPerPage);
        return response.json({
          data: activities.toJSON().data,
          meta: activities.toJSON().meta,
        });
      }
     
  }
  
  public async create({ inertia }: HttpContextContract) {
    return inertia.render("Home");
  }
  public async store({ request, response }: HttpContextContract) {
    // Extract tasks and status_id from the request
    const data = request.only(["tasks", "status_id"]);
  
    const taskLines = data.tasks || []; // Ensure tasks is at least an empty array
    const statusIds = data.status_id || []; // Ensure status_ids is at least an empty array
  
    // Check if the number of tasks matches the number of status_ids
    if (taskLines.length !== statusIds.length) {
      return response.badRequest({
        error: "The number of tasks must match the number of status_ids.",
      });
    }
    
  // Iterate through taskLines and statusIds in sync
  for (let i = 0; i < taskLines.length; i++) {
    const statusId = statusIds[i]; // Get the corresponding status_id for the task

    
   const tasks = data.tasks.filter(task =>( task.length > 0 && task.length >= 5));

    // Create the activity for each task with its corresponding status_id
    const activity = await Activity.create({
      activity: tasks[i], // Task at index i
      status_id: statusId, // Status at the same index i  
    });
    await activity.save();
  }

  return response.status(200).json({
    status: 'success',
    message: 'NEW ACTIVITY ADDED SUCCESSFULLY',
    redirectUrl: "/today", // Include the redirect URL for frontend navigation
  });
}
  

  public async today({ inertia }: HttpContextContract) {
    const today = DateTime.local().toISODate(); // Get today's date in ISO format (YYYY-MM-DD)

    // Fetch activities where the `createdAt` date is equal to today
    const activities = await Activity.query().whereRaw("DATE(created_at) = ?", [
      today,
    ]); // assuming your DB uses 'created_at' for timestamp

    return inertia.render("Today", { activities });
  }

  public async todayupdate({ request, response, params }: HttpContextContract) {
    try {
      // Extract data
      const data = request.only(["statusId"]);
      const activityId = params.id;

      // Log incoming data
      console.log("Request Data:", data);

      // Fetch the activity
      const activity = await Activity.find(activityId);
      if (!activity) {
        console.log(`Activity with ID ${activityId} not found`);
        return response.status(404).json({ message: "Activity not found" });
      }

      // Update status_id
      activity.status_id = data.statusId;


      if (activity.status_id === 1) {

      }
      // Save to DB
      await activity.save();

      console.log("Activity updated successfully:", activity);

      // Return success response
      return response.json({ message: "CHANGES HAVE BEEN SUBMITTED", activity });
    } catch (error) {
      console.error("Error in todayupdate:", error);
      return response.status(500).json({ message: "Internal Server Error", error });
    }
  }


  public async completed({ inertia, request }: HttpContextContract) {
    const search = request.input("search", "").toLowerCase();

    // Fetch activities excluding those marked as deleted
    const activities = await Activity.query()
      .where("status_id", 1) // Exclude deleted activities
      .if(search, (query) => {
        query.where("activity", "like", `%${search}%`);
      })
      .orderBy("activity", "asc");
    return inertia.render("Completed", { activities });
  }

  public async pending({ inertia, request }: HttpContextContract) {
    const search = request.input("search", "").toLowerCase();

    // Fetch activities excluding those marked as deleted
    const activities = await Activity.query()
      .where("status_id", 1) // Exclude deleted activities
      .if(search, (query) => {
        query.where("activity", "like", `%${search}%`);
      })
      .orderBy("activity", "asc");
    return inertia.render("Pending", { activities });
  }

  public async paused({ inertia, request }: HttpContextContract) {
    const search = request.input("search", "").toLowerCase();

    // Fetch activities excluding those marked as deleted
    const activities = await Activity.query()
      .where("is_paused", 1) // Exclude deleted activities
      .if(search, (query) => {
        query.where("activity", "like", `%${search}%`);
      })
      .orderBy("created_at", "desc");
    return inertia.render("Paused", { activities });
  }

  public async archieved({ inertia, request }: HttpContextContract) {
    const search = request.input("search", "").toLowerCase();

    // Fetch activities excluding those marked as deleted
    const activities = await Activity.query()
      .where("is_archieved", 1) // Exclude deleted activities
      .if(search, (query) => {
        query.where("activity", "like", `%${search}%`);
      })
      .orderBy("activity", "asc");

    return inertia.render("Archieved", { activities });
  }

  public async deleted({ inertia, request }: HttpContextContract) {
    const search = request.input("search", "").toLowerCase();

    // Fetch activities excluding those marked as deleted
    const activities = await Activity.query()
      .where("is_deleted", 1) // Exclude deleted activities
      .if(search, (query) => {
        query.where("activity", "like", `%${search}%`);
      })
      .orderBy("created_at", "desc");
    return inertia.render("Deleted", { activities });
  }
  public async show({ inertia, response, params }: HttpContextContract) {
    const activityId = params.id;

    // Simulate fetching the activity from a database
    const activity = await Activity.find(activityId);
    console.log("Fetched Activity:", activity);

    if (activity) {
      const statusId = activity.status_id;

      if (activity.is_archieved === 1) {
        return inertia.render("viewPageForArchieved", { activity });
      }
      if (activity.is_paused === 1) {
        return inertia.render("viewPageForPaused", { activity });
      } else if (statusId === 2) {
        return inertia.render("viewPageForPending", { activity });
      } else if (statusId === 1) {
        return inertia.render("viewPageForCompleted", { activity });
      } else {
        response.send("Unknown status");
      }
    } else {
      response.status(404).send("Activity not found");
    }
  }
  public async details({ params, inertia }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);

    // Return the activity to be edited
    return inertia.render("Details", { activity });
  }

  
  public async edit({ params, inertia }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);

    // Return the activity to be edited
    return inertia.render("Edit", { activity });
  }

  public async updatename({ request, params, response }: HttpContextContract) {
    const activityId = params.id;
  
    try {
      // Validate the request data
      const activitySchema = schema.create({
        activity: schema.string({}, [
          rules.required(),
          rules.minLength(5),
        ]),
      });
  
      const data = await request.validate({ schema: activitySchema });
  
      // Find the activity by ID
      const activity = await Activity.find(activityId);
  
      if (!activity) {
        return response.status(404).json({
          status: 'error',
          message: 'Task not found',
        });
      }
  
      // Update the activity field
      activity.activity = data.activity;
  
      // Save the changes
      await activity.save();
  
      return response.status(200).json({
        status: 'success',
        message: 'ACTIVITY NAME UPDATED SUCCESSFULLY',
        redirectUrl: `/show/${activity.id}`, // Include the redirect URL for frontend navigation
      });
    } catch (error) {
      if (error.messages) {
        return response.status(422).json({
          status: 'error',
          message: error.messages.errors[0].message, // Send the first validation error message
        });
      }
  
      return response.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred.',
      });
    }
  }
  
  public async updatestatus({ params, inertia }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);

    // Return the activity to be edited
    return inertia.render("Status", { activity });
  }

  public async editstatus({ request, response, params }: HttpContextContract) {
    try {
      // Extract data
      const data = request.only(["statusId"]);
      const activityId = params.id;

      // Log incoming data
      console.log("Request Data:", data);

      // Fetch the activity
      const activity = await Activity.find(activityId);
      if (!activity) {
        console.log(`Activity with ID ${activityId} not found`);
        return response.status(404).json({ message: "Activity not found" });
      }

      // Update status_id
      activity.status_id = data.statusId;

      // Save to DB
      await activity.save();

      console.log("Activity updated successfully:", activity);

      // Return success response
      return response.json({ message: "CHANGES HAVE BEEN SUBMITTED", activity });
    } catch (error) {
      console.error("Error in todayupdate:", error);
      return response.status(500).json({ message: "Internal Server Error", error });
    }
  }

  
  public async pause({ params, response }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by its ID
    const activity = await Activity.find(activityId);

    if (!activity) {
      return response.status(404).json({ message: "Activity not found" });
    }

    // Mark the activity as paused
    activity.is_paused = 1;

    // Save the changes
    await activity.save();

    // Return a success message
    return response.json({ message: "Activity PAUSED", activity });
  }

  public async start({ params, response }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);

    if (activity) {
      activity.is_paused = 0;

      await activity.save();

      return response.json({
        message: "ACTIVITY IS NO LONGER PAUSED",
        redirectUrl: `/show/${activity.id}`, // Include the redirect URL in the response
      });
    }
  }
  public async archivePausedActivity({ params, response }: HttpContextContract) {
    const activity = await Activity.find(params.id);

    if (!activity) {
      return response.notFound({ error: "Activity not found" });
    }

    if (activity.is_paused === 1) {
      activity.is_archieved = 1;
      await activity.save();
      return response.ok({ message: "Activity archived successfully" });
    }

    return response.badRequest({ error: "Activity is not paused" });
  }
  public async archieve({ params, response }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by its ID
    const activity = await Activity.find(activityId);

    if (!activity) {
      return response.status(404).json({ message: "Activity not found" });
    }

    // Update the status of the activity to 'archived'
    activity.is_archieved = 1;

    // Save the updated activity to the database
    await activity.save();

    // Return a success message
    return response.json({ message: "Activity ARCHIEVED", activity });
  }

  public async unarchieve({ params, inertia }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);

    if (activity) {
      // Check if the original status_id was 1
      if (activity.status_id === 1) {
        return inertia.render("Review", { activity });
      } else {
        return inertia.render("View", { activity });
      }
    }

    // Handle if the activity is not found
    return inertia.render("Error", { message: "Activity not found" });
  }

  public async review({ params, inertia }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);

    if (activity) {
      // Check if the original status_id was 1
      if (activity.status_id === 1) {
        return inertia.render("Review", { activity });
      } else {
        return inertia.render("View", { activity });
      }
    }

    // Handle if the activity is not found
    return inertia.render("Error", { message: "Activity not found" });
  }

  public async restart({ request, params, response }: HttpContextContract) {
    const data = request.only(["status_id"]); // Get status_id from request
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);

    if (!activity) {
      return response.status(404).json({ message: "Activity not found" });
    }

    // Update the activity's status_id
    activity.status_id = data.status_id;
    activity.is_archieved = 0;

    // Save the changes to the database
    await activity.save();

    return response.json({
      message: "ACTIVITY IS NO LONGER ARCHIEVED",
      redirectUrl: `/show/${activity.id}`, // Include the redirect URL in the response
    });
  }

  public async view({ params, inertia }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);

    if (activity) {
      // Check if the original status_id was 1
      if (activity.status_id === 2) {
        return inertia.render("View", { activity });
      } else {
        return inertia.render("Review", { activity });
      }
    }

    // Handle if the activity is not found
    return inertia.render("Error", { message: "Activity not found" });
  }

  public async revive({ request, params, response }: HttpContextContract) {
    const data = request.only(["status_id"]); // Get status_id from request
    const activityId = params.id;

    // Find the activity by ID
    const activity = await Activity.find(activityId);

    if (!activity) {
      return response.status(404).json({ message: "Activity not found" });
    }

    // Update the activity's status_id
    activity.status_id = data.status_id;
    activity.is_archieved = 0;

    // Save the changes to the database
    await activity.save();

    return response.json({
      message: "ACTIVITY IS NO LONGER ARCHIEVED",
      redirectUrl: `/show/${activity.id}`, // Include the redirect URL in the response
    });
  }

  public async destroy({ params, response }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by its ID
    const activity = await Activity.find(activityId);

    if (!activity) {
      return response.status(404).json({ message: "Activity not found" });
    }
    activity.is_deleted = 1;

    await activity.save();

    return response.json({
      message: "ARE YOU SURE YOU WANT TO DELETE THIS ACTIVITY?!",
      redirectUrl: "/", // Include the redirect URL in the response
    });
  }
  public async erase({ params, response }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by its ID
    const activity = await Activity.find(activityId);

    if (!activity) {
      return response.status(404).json({ message: "Activity not found" });
    }

    await activity.delete();

    return response.json({
      message: "DELETED?!",
    });
  }

  public async recycle({ params, response }: HttpContextContract) {
    const activityId = params.id;

    // Find the activity by its ID
    const activity = await Activity.find(activityId);

    if (!activity) {
      return response.status(404).json({ message: "Activity not found" });
    }
    activity.is_deleted = 0;

    await activity.save();

    return response.json({
      message: "RECYCLED SUCCESSFULLY",
    });
  }

  public async deleteall({ response }: HttpContextContract) {
    const deletedCount = await Activity.query().where("is_deleted", 1).delete();
    return response.json({
      message: `${deletedCount} activities deleted successfully.`,
    });
  }
}
