const { fstat } = require('fs');
const Sauce = require('../models/sauce');
const fs = require('fs');

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
    usersLiked: [],
    usersDisliked: []
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

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => res.status(200).json(sauce))
  .catch(error => res.status(404).json({ error }));
}

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {
    if (sauce.userId != req.auth.userId) {
      res.status(403).json({ message: 'unauthorized request'});
    } else {
      Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({message: 'Sauce modified'}))
      .catch(error => res.status(401).json({ error }));
    }
  })
  .catch((error) => {
    res.status(400).json({ error });
  });
}

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    if (sauce.userId != req.auth.userId) {
      res.status(403).json({ message: 'unauthorized request' });
    } else { 
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
        .then(() => { res.status(200).json({message: 'Sauce deleted'})})
        .catch(error => res.status(401).json({ error }));
      });
    }

  })
  .catch( error => {
    res.status(500).json({ error });
  });
}

exports.appreciationSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const userId = req.auth.userId;
    const bodyLike = req.body.like;

    if (bodyLike === 1) {
      if (!sauce.usersLiked.includes(userId)){     
        sauce.likes++;
        sauce.usersLiked.push(userId);
        sauce.save()
        .then(() => res.status(200).json({message: 'Add like sauce'}))
        .catch(error => res.status(401).json({ error }));
      } 
    } else if (bodyLike === 0) { 
      if (sauce.usersLiked.includes(userId)) {
        let indiceUsersLiked = sauce.usersLiked.indexOf(userId);
        sauce.usersLiked.splice(indiceUsersLiked, 1);
        sauce.likes--;
        sauce.save()
        .then(() => res.status(200).json({message: 'Remove like sauce'}))
        .catch(error => res.status(401).json({ error }));
      } else if (sauce.usersDisliked.includes(userId)){
        let indiceUsersDisliked = sauce.usersDisliked.indexOf(userId);
        sauce.usersDisliked.splice(indiceUsersDisliked, 1);
        sauce.dislikes--;
        sauce.save()
        .then(() => res.status(200).json({message: 'Remove disliked sauce'}))
        .catch(error => res.status(401).json({ error }));
      }
    } else if (bodyLike < 0) {
      if (!sauce.usersDisliked.includes(userId)){
        sauce.usersDisliked.push(userId);
        sauce.dislikes++;
        sauce.save()
        .then(() => res.status(200).json({message: 'Add disliked sauce'}))
        .catch(error => res.status(401).json({ error }));
      } 
    }
  })
  .catch(error => res.status(404).json({ error }));
}