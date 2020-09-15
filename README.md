# Twitter as a Database

## Overview

Twitter as a Database is an simple implementation of a DBMS that features:

* Basic Atomic Values with Types
* Visibility (Public and Secret)
* ACID Properties

By utilizing the Twitter API, this project encode data and types in hashtags using a custom schema, effective creating a key/value store per tweet (in this case abstracted to users).

Currently, the demo twitter account is at [@tweets_as_a_db](https://twitter.com/tweets_as_a_db).

## Usage

Configure a `.env` file:

```bash
# Hosting Variables
HOST=<String>
PORT=<String>

# Twitter API Keys
CONSUMER_PUBLIC_KEY=<String>
CONSUMER_SECRET_KEY=<String>
ACCESS_PUBLIC_KEY=<String>
ACCESS_SECRET_KEY=<String>

# Default Database screen_name
DEFAULT_DB=<String>

# SSL
SSL_ENABLED=<Boolean>
```

And then run:

```bash
npm start
# OR
yarn start
```

To interface with the database, use the API defined in [Documentation](#documentation). Currently, there is no development kit that can interface with the database directly, so requests will have to be made through HTTP requests.

## Documentation

Twitter as a Database has an OpenAPI 3.0.0 Contract which you can find in [`/config/openapi.json`](config/openapi.json).

## Basic Features

For now, there is only one test database that uses the `user` field as a primary key based on the `DEFAULT_DB` (twitter screen_name) and private and public keys set in the `.env` file.

Besides that, every user also has a unique id from the tweet in which the hashtag data is stored, but it is not a public field.

Each field/hashtag is required to have visibility and type properties.

For visibility, there is:

* `secret` : Only the password field can be secret and cannot be modified
* `public` : Modifiable fields that can be seen in any user

For types, there are 3 primitive types:

* `strg` : String
* `numb` : Number
* `bool` : Boolean

There is a way to create custom types in the future, but for now it is disabled.

Example of a Tweet:

```text
#USERPUBLICSTRGsteven
#PASSWORDSECRETSTRGtest123
#AGEPUBLICNUMB16
#BOOMPUBLICBOOLtrue
```

Corresponding Table and Record

| user (public)| password (secret)| age (public) | boom (public) |
| - | - | - | - |
| "steven" | "test123" | 16 | true |

The reason the hashtags are so terribly divided into Uppercase Letters and
the rest of the characters is because Twitter hashtags cannot have any punctuation.

Due to the limitation, the ugly way of differentiating properties and values based on capitalization was eventually developed.

Implicitly, the values' first character are limited to numbers and lowercase letters, otherwise the properties and values would be scrambled.

However, the rest of the value can be any alphanumeric character as long as it matches the type.

## Testing

For the project, the API routes were tested using [nock](https://github.com/nock/nock) and [jest](https://jestjs.io/). Tests include a variety of cases such as:

* Invalid Data
* ACID properties
* Unit Tests

To run the tests, run:

```bash
npm test
# OR
yarn test
```

## Motivation

While I was in enrolled in [Rutgers CS336](https://www.cs.rutgers.edu/courses/principles-of-information-and-data-management) and got interested in building my own database.

To no one's surprise, it turns out that building databases is ridiculously difficult (at least for me). However, that did not stop me from thinking of this esoteric project.

The project allowed me to specifically hone my development skills more, having a reasonable architecture as well as having 100% test coverage.

Maybe some people will enjoy this, as it is a simple database that interacts with a 3rd party API. Maybe some people will get inspired and think of their own esoteric project.

In terms of academics, a related field would be [Steganography](https://en.wikipedia.org/wiki/Steganography), the difference being that although the data is encoded in a tweet, it is not strictly concealed in terms of cryptography.

Either way, to any who read this, thanks for supporting me!

[syall](https://github.com/syall)
