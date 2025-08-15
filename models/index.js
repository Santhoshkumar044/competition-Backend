// import createUserModel from './users.js';
// import createHostModel from './hostschema.js';
// import createProfileModel from './Profileschema.js';
// import createCompetitionModel from './competition.js';
// import createEventModel from './eventSchema.js';
// import createVenueModel from './venueschema.js';
// import createCompetitionParticipantModel from './competitionConfirmation.js';
// import createEventConfirmationModel from './eventConfirmationschema.js';
// import mongoose from 'mongoose';
// /**
//  * Initialize all models with the correct database connections
//  * @returns {Object} Models for each database
//  */
// export default function initModels() {
//   // Main database (MONGO_URI)
//   const myProjectDb = mongoose.connection.useDb('test');
  
//   // Venue database (MONGO_URI2)
//   const venueDb = mongoose.connection.useDb('venueDB');

//   return {
//     User: createUserModel(myProjectDb),
//     Host: createHostModel(myProjectDb),
//     Profile: createProfileModel(myProjectDb),
//     Competition: createCompetitionModel(myProjectDb),
//     Event: createEventModel(myProjectDb),
//     CompetitionParticipant: createCompetitionParticipantModel(myProjectDb),
//      EventParticipant: createEventConfirmationModel(myProjectDb),
//     Venue: createVenueModel(venueDb),
//     // Reference to the DB connections if needed
//     _dbs: {
//       myProjectDb,
//       venueDb
//     }
//   };
// }


import createUserModel from './users.js';
import createHostModel from './hostschema.js';
import createProfileModel from './Profileschema.js';
import createCompetitionModel from './competition.js';
import createEventModel from './eventschema.js';
import createVenueModel from './venueschema.js';
import createCompetitionParticipantModel from './competitionConfirmation.js';
import createEventConfirmationModel from './eventConfirmationschema.js';
//import createtemplateModel from './templateSchema.js';
import viewModel from './viewschema.js';
import mongoose from 'mongoose';

/**
 * Initialize all models with the correct database connections.
 * @param {mongoose.Connection} venueDbConn - The connection to the second cluster (venue DB).
 */
export default function initModels(venueDbConn) {
  const myProjectDb = mongoose.connection.useDb('test');

  return {
    // Models from main DB
    User: createUserModel(myProjectDb),
    Host: createHostModel(myProjectDb),
    Profile: createProfileModel(myProjectDb),
    Competition: createCompetitionModel(myProjectDb),
    Event: createEventModel(myProjectDb),
    CompetitionParticipant: createCompetitionParticipantModel(myProjectDb),
    EventParticipant: createEventConfirmationModel(myProjectDb),
    //Template: createtemplateModel(myProjectDb),
    View: viewModel(myProjectDb),

    // ✅ Venue model from second cluster
    Venue: createVenueModel(venueDbConn),

    // Expose both DB handles
    _dbs: {
      myProjectDb,
      venueDb: venueDbConn
    }
  };
}
