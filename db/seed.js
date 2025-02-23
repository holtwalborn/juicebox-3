

const {
  createUser,
  client,
  getAllUsers,
  updateUser,
  createPost
} = require('./index');

// new function, should attempt to create a few users


// then modify rebuildDB to call our new function
async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
  } catch (error) {
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    await createUser({ username: 'albert', password: 'bertie99',name:'mel',location: 'here'  });
    await createUser({ username: 'sandra', password: '2sandy4me', name:'keeran', location:'us' });
    await createUser({ username: 'glamgal', password: 'soglam' , name:'saorse', location:'ireland' });
  

    console.log("Finished creating users!");
  } catch(error) {
    console.error("Error creating users!");
    throw error;
  }
}
async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    // have to make sure to drop in correct order
    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts;
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: "First Post",
      content: "This is my first post. I hope I love writing blogs as much as I love writing them."
    });

    
  } catch (error) {
    throw error;
  }
}


async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name varchar(255) NOT NULL,
        location varchar(255) NOT NULL,
        active boolean DEFAULT true
      );
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id),
        title varchar(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
      CREATE TABLE id (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL  
      );
      CREATE TABLE post_tags (
       "postId" INTEGER REFERENCES posts(id) UNIQUE,
       "tagId" INTEGER REFERENCES tags(id) UNIQUE 
      );
    `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

 
async function createTags(tagList) {
  if (tagList.length === 0) { 
    return; 
  }const { rows: [ tags ] }= await client.query(`
  INSERT INTO tags(name)
  VALUES ($1), ($2), ($3)
  ON CONFLICT (name) DO NOTHING;
`,);
//now this is unreachable, dont forget to fix it after finding whats wrong with the tables
return tags;
 
  const insertValues = tagList.map(
    (insertValues, index) => `$${index + 1}`).join('insertValues), (index');

  // need something like $1, $2, $3
  const { rows: [ values ] }= await client.query(`
  INSERT INTO values(name)
  VALUES ($1), ($2), ($3)
  ON CONFLICT (name) DO NOTHING;
`,);
  const selectValues = tagList.map(
    (selectValues, index) => `$${index + 1}`).join('selectValues, index');

  try {//this is unreachable, come back and fix it
    const { rows: [ tags ] }= await client.query(`
  INSERT INTO tags(name)
  VALUES ($1), ($2), ($3)
  ON CONFLICT (name) DO NOTHING;
  SELECT * FROM tags
`,);
return tags
  } catch (error) {
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
  } catch (error) {
    throw error;
  }
}


async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("Result:", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY"
    });
    console.log("Result:", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:", posts);

    console.log("Calling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content"
    });
    console.log("Result:", updatePostResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database tests!");
  } catch (error) {
    console.log("Error during testDB");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());