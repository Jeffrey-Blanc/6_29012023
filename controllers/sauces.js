const Sauce = require('../models/sauce');

// exports.createSauce = (req, res, next) => {
//   const sauce = new Sauce({
//     name: req.body.name,
//     manufacturer: req.body.manufacturer,
//     description: req.body.description,
//     imageUrl: req.body.imageUrl,
//     mainPepper: req.body.mainPepper,
//     heat: req.body.heat,
//     userId: req.body.userId
//   });
//   sauce.save().then(
//     () => {
//       res.status(201).json({
//         message: 'Post saved successfully !'
//       });
//     }
//   ).catch(
//     (error) => {
//       res.status(400).json({
//         error: error
//       });
//     }
//   );
// };

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: 0,
    usersDisliked: 0
  });

  sauce.save()
  .then(() => {
    res.status(201).json({message: 'Sauce saved !'})
  })
  .catch (error => {
    res.status(400).json({ error })
  })
};


exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};