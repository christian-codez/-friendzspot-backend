const mongoose = require('mongoose');
// const { Post } = require('../../models/post');
// const { User } = require('../../models/user');

// const userOne = {
//   name: 'Test One',
//   verified: 'true',
//   email: 'test1@gmail.com',
//   password: '12345',
//   gender: 'male',
//   country: 'USA',
//   age: '28',
//   bio: 'This is a sample bio',
//   stacks: ['python', 'nodejs'],
// };

// const mockId = mongoose.Types.ObjectId();
// const userTwoId = mongoose.Types.ObjectId();
// const userThreeId = mongoose.Types.ObjectId();
// const postOneId = mongoose.Types.ObjectId();
// const commentId = mongoose.Types.ObjectId();

// const userTwo = {
//   _id: userTwoId,
//   name: 'Test Two',
//   email: 'test2@email,com',
//   password: '12345pass!',
//   stacks: ['JS', 'Python', 'PHP'],
//   gender: 'male',
//   age: '27',
//   country: 'Nigeria',
//   bio: 'John is a 27 year old JS developer from Nigeria.',
// };

// const userThree = {
//   _id: userThreeId,
//   name: 'Test Three',
//   email: 'atest3@email,com',
//   password: '12345pass!',
//   stacks: ['JS', 'Python', 'PHP'],
//   gender: 'male',
//   age: '27',
//   country: 'Nigeria',
//   bio: 'John is a 27 year old JS developer from Nigeria.',
// };

// const postOne = {
//   _id: postOneId,
//   title: 'Post One',
//   content:
//     'Lorem Ipsum Generator is an online tool that can be used to create dummy text for your website or project. Make your selections and click Generate. Choose to save as HTML, plain text, or select text and copy and paste.',
//   author: userTwoId,
//   comments: [
//     {
//       _id: commentId,
//       comment: 'sample comment 1',
//       user: userThreeId,
//     },
//     {
//       comment: 'sample comment 2',
//       user: userTwoId,
//     },
//   ],
// };

// const postTwo = {
//   _id: mongoose.Types.ObjectId(),
//   title: 'Post Two',
//   content:
//     'Lorem Ipsum Generator is an online tool that can be used to create dummy text for your website or project. Make your selections and click Generate. Choose to save as HTML, plain text, or select text and copy and paste.',
//   author: userThreeId,
// };

// const PostThree = {
//   title: 'Post Three',
//   content:
//     'Lorem Ipsum Generator is an online tool that can be used to create dummy text for your website or project. Make your selections and click Generate. Choose to save as HTML, plain text, or select text and copy and paste.',
// };

// const setupDatabase = async () => {
//   await User(userTwo).save();
//   await User(userThree).save();
//   await Post(postOne).save();
//   await Post(postTwo).save();
// };

// const teardownDatabase = async () => {
//   await User.deleteMany({});
//   await Post.deleteMany({});
// };

// module.exports = {
//   mockId,
//   userOne,
//   userTwo,
//   commentId,
//   PostThree,
//   postTwo,
//   postOne,
//   userThree,
//   setupDatabase,
//   teardownDatabase,
// };
