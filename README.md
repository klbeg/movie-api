<h3>Stack used</h3>
Movie API is built with Node, Mongodb, Express and React.
<br>
<br>

<h3>Other tools used include:</h3>
<ul>
  <li>•bcrypt </li>
  <li>•body-parser</li>
  <li>•cors</li>
  <li>•express</li>
  <li>•express-validator</li>
  <li>•jsonwebtoken</li>
  <li>•mongoose</li>
  <li>•morgan</li>
  <li>•passport</li>
  <li>•passport-jwt</li>
  <li>•passport-local</li>
  <li></li>

•passport-local<h3>Objective:</h3>
<p>
Build the server side component of a 'movie' web application. It will
provide users with access to information about movies, directors and
genres. Users will be able to sign up, update their personal information
and create a list of their favorite movies.
</p>
<h3>Endpoints</h3>
<table>
<tr>
<th>Business Logic</th>
<th>URL</th>
<th>HTTP Method</th>
<th>Request Body Format</th>
<th>Response Body Format</th>
</tr>
<tr>
<th>User login</th>
<th>/users/:Username/:Password</th>
<th></th>
<th></th>
<th></th>
</tr>
<tr>
<td>Register new user</td>
<td>/users</td>
<td>POST</td>
<td>
A JSON object containing user data. <br />
{ <br />
"Name": "Jimmy Jambo", <br />
"Username": "Sandwichman", <br />
"Password": "hiccupsRule", <br />
"Email": "email@domain.com", <br />
"Birthdate": "1982-01-01" <br />
}
</td>
<td>
JSON containing created user.  
 { <br>
"FavoriteMovies": [], <br>
"\_id": "60a70ac6cc639b3a4d7101af", <br>
"Name": "fName lName", <br>
"Username": "testUser", <br>
"Password": "pass123", <br>
"Email": "email@domain.com", <br>
"Birthdate": "1982-01-01T00:00:00.000Z", <br>
"**v": 0 <br>
}
</td>
</tr>
<tr>
<td>Update user info</td>
<td>/users/:username</td>
<td>PUT</td>
<td>
JSON object with info to update. <br>
Enter only key/values to be updated. <br>
Any unentered key/values won't be updated. <br>
{ <br>
"Name": "New Name", <br>
"Username": "newUsername", <br>
"Password": "newPassword", <br>
"Email": "newEmail@domain.com", <br>
"Birthdate": "1999-01-01", <br>
}
</td>
<td>
JSON containing updated userinfo. <br>
{ <br>
"FavoriteMovies": [], <br>
"\_id": "60a70ac6cc639b3a4d7101af", <br>
"Name": "fName lName", <br>
"Username": "newUsername", <br>
"Password": "newPassword", <br>
"Email": "newEmail@domain.com", <br>
"Birthdate": "1999-01-01T00:00:00.000Z", <br>
"**v": 0 <br>
}
</td>
</tr>
<tr>
<td>Add movie to user's favorites</td>
<td>/movies/:MovieID</td>
<td>PUT</td>
<td>None</td>
<td>
Text message confiming (MovieID) has been added. <br>
ex: MovieID 60a45abde8fd876d8ae55927 has been added to favorites.
</td>
</tr>
<tr>
<td>Remove movie from user's favorites</td>
<td>/movies/:MovieID</td>
<td>DELETE</td>
<td>None</td>
<td>
Text message confiming (MovieID) has been removed. <br>
ex: MovieID 60a45abde8fd876d8ae55927 has been removed from favorites.
</td>
</tr>
<tr>
<td>Delete user account</td>
<td>/users/:username</td>
<td>DELETE</td>
<td>None</td>
<td>
Text message confiming (username) account deleted. <br>
ex: Sandwichman was deleted.
</td>
<tr>
<td>Return a list of all movies</td>
<td>/movies</td>
<td>GET</td>
<td>None</td>
<td>A JSON array containing all movie objects</td>
</tr>
<tr>
<td>Search movies by title</td>
<td>/movies/:Title</td>
<td>GET</td>
<td>None</td>
<td>
A JSON object containing a description of the movie, genre, director,
image URL and wether it's featured
</td>
</tr>
<tr>
<td>Search genres by name</td>
<td>/genres/:Name</td>
<td>GET</td>
<td>None</td>
<td>
JSON containing matched genre info. ex: <br>
{ <br>
"Name": "Thriller", <br>
"Description": "Thriller film, also known as suspense film or <br>
suspense thriller, is a broad film genre that involves excitement and suspense in <br>
the audience. Tension is created by delaying what the audience sees as inevitable, <br>
and is built through situations that are menacing or where escape seems impossible." <br>
}
</td>
</tr>
<tr>
<td>Search directors by name</td>
<td>/directors/:Name</td>
<td>GET</td>
<td>None</td>
<td>
JSON containing matched director info. ex: <br>
{ <br>
"Name": "Adam McKay", <br>
"Bio": "Adam McKay was born April, 17 1968. He is an American film and television <br>
director, producer, screenwriter, and comedian. McKay got his start as the head <br>
writer for Saturday Night Live.", <br>
"Birth": "1968" <br>
}
</td>
</tr>
</tr>
</table>
