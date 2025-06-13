// import Host from '../models/hostschema.js';

// export const createHost = async (req, res) => {
//   const { host_id, hostname, email, dept } = req.body;

//   if (!host_id || !hostname || !email) {
//     return res.status(400).json({ error: 'host_id, hostname, and email are required' });
//   }

//   try {
//     const existing = await Host.findOne({ email });
//     if (existing) {
//       return res.status(409).json({ message: 'Host with this email already exists' });
//     }

//     const host = new Host({ host_id, hostname, email, dept });
//     await host.save();
//     res.status(201).json({ message: 'Host added successfully', host });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to add host', details: error.message });
//   }
// };


export const createHost = async (req, res) => {
  const { host_id, hostname, email, dept } = req.body;

  if (!host_id || !hostname || !email) {
    return res.status(400).json({ error: 'host_id, hostname, and email are required' });
  }

  try {
    const Host = req.models.Host;

    const existing = await Host.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Host with this email already exists' });
    }

    const host = new Host({ host_id, hostname, email, dept });
    await host.save();
    res.status(201).json({ message: 'Host added successfully', host });
  } catch (error) {
    console.error('❌ Error creating host:', error.message);
    res.status(500).json({ error: 'Failed to add host', details: error.message });
  }
};
