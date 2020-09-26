import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4'
// SCALAR TYPES // String, Boolean, Int, Float (Decimals), ID
// (!) Para que el valor no este vacio de forma imperatitleva
// Demo user data
const users = [
  {
    id: '1',
    name: 'Bruno',
    email: 'bruno132mg98@gmail.com',
    age: 22
  },
  {
    id: '2',
    name: 'Lilia',
    email: 'lili@shsh.es',
    age: 24,
  },
  {
    id: '3',
    name: 'Victor',
    email: 'liddddli@shsh.es',
    age: 14,
  }
]

const posts = [
  {
    id: '1',
    title: 'Buenas',
    body: 'tardes',
    published: false,
    author: '1'
  },
  {
    id: '21',
    title: 'Buenos',
    body: 'holll',
    published: false,
    author: '2'
  },
  {
    id: '3',
    title: 'Buenas',
    body: 'Noches',
    published: true,
    author: '3'
  }  
]

const comments = [
  {
    id: '101', 
    text: 'Comment1',
    author: '1'
  },
  {
    id: '102', 
    text: 'Comment2',
    author: '2',
    post: '1'
  },
  {
    id: '103', 
    text: 'Comment3',
    author: '2',
    post: '2'
  },
  {
    id: '104', 
    text: 'Comment4',
    author: '3',
    post: '3'
  }
]

// Type difinititleons (schema)
  const typeDefs = `
    type Query {
      posts(query: String): [Post!]!
      users(query: String): [User!]!
      me: User!
      post: Post
      comments: [Comment!]
    }

    type Mutation {
      createUser(data: CreateUserInput): User!
      createPost(data: CreatePostInput): Post!
      createComment(data: CreateCommentInput): Comment!
    }

    input CreateCommentInput {
      text: String!
      author: ID!
      post: ID!
    }
    input CreateUserInput{
      name: String!
      email: String!
      age: Int!
    }
    input CreatePostInput {
      title: String!
      body: String!
      published: Boolean!
      author: ID!
    }

    type User {
      id: ID!
      name: String!
      email: String!
      age: Int
      posts: [Post!]!
      comments: [Comment!]
    }
    
    type Comment {
      id: ID!
      text: String!
      author: User!,
      post: Post
    }
    type Post {
      id: ID!
      title: String!
      body: String!
      published: Boolean!
      author: User!
    }
  `

// Resolvers
const resolvers = {
  Query: {
    comments(parent, args, ctx, info) {
      return comments
    },
    posts(parent, args, ctx, info) {
      if (!args.query) return posts

      return posts.filter((post) => {
        const titleMatch = post.title.toLocaleLowerCase().includes(args.query.toLocaleLowerCase())
        const bodyMatch = post.body.toLocaleLowerCase().includes(args.query.toLocaleLowerCase())

        return titleMatch || bodyMatch
      })
    },
    users(parent, args, ctx, info) {
      if (!args.query) return users

      return users.filter((item) => {
        return item.name.toLocaleLowerCase().includes(args.query.toLocaleLowerCase())
      })
    },
    me() {
      return {
        id: '12239',
        name: 'Bruno Martínez',
        email: 'bruno@123.com',
        age: 22
      }
    },
    post() {
      return {
        id: 'j094rel',
        title: 'Buenas tardes',
        body: 'Esto es un nuevo post',
        publishedhed: true,
      }
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return post.author === parent.id
      })
    },
    comments (parent, args, ctx, info) {
      return comments.filter(comment => comment.author === parent.id)
    }
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emialTaken = users.some(user => user.email === args.data.email)

      if (emialTaken) throw new Error('Email is taken')
      
      // const one = {
      //   name: 'jjj'
      // }
      // const two = {
      //   population: 236789,
      //   ...one
      // }

      const user = {
        id: uuidv4(),
        ...args.data
      }

      users.push(user)

      return user
    },
    createPost(parent, args, ctx, info) {
      const userExist = users.some(user => user.id === args.data.author)

      if (!userExist) throw new Error('The user does not exists')

      const post = {
        id: uuidv4(),
        ...args.data   
      }

      posts.push(post)

      return post
    },
    createComment(parent, args, ctx, info) {
      if (!args.author, !args.post) throw new Error('Error, faltan ids')
      if (!users.some(user => user.id === args.data.author)) throw new Error('Usuario no encontrado')
      if (!posts.some(post => post.id === args.data.post)) throw new Error('Post no encontrado')

      const comment = {
        id: uuidv4(),
        text: args.data.text,
        author: args.data.author,
      }
      // const post = posts.find(post => post.id === args.post)

      // post.comments.push(post)
      comments.push(comment)

      return comment
    }
  },
  Post: {
    author (parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author
      })
    }
  },
  Comment: {
    author (parent, args, ctx, info) {
      return users.find(user => user.id === parent.author)
    },
    post (parent, args, ctx, info) {
      return posts.find(post => post.id === parent.post)
    }
  }
}

// Start server
const server = new GraphQLServer({
  typeDefs,
  resolvers
})

server.start(() => {
  console.log('server on')
})