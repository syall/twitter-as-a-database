# Twitter as a Database

Twitter as a Database is an extremely crude implementationof a DBMS that features:

* Basic Atomic Values with Types
* Visibility (Public and Secret)
* ACID Properties

## Installation

Generate a host.key and host.cert file in the config folder to run on https:

```bash
openssl genrsa 2048 > host.key
chmod 400 host.key
openssl req -new -x509 -nodes -sha256 -days 365 -key host.key -out host.cert
```

Configure a dotenv file in the root folder:

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

## Documentation

Twitter as a Database has an OpenAPI 3.0.0 Contract which you can find in /config/openapi.json.

## Basic Features

For now, there is only one test database that uses the "user" field as a primary key based on the DEFAULT_DB (twitter screen_name) and private and public keys set in the .env file.

Besides that, every user also has a unique id from the tweet in which the hashtag data is stored, but it is not a public field.

Each field/hashtag is required to have visibility and type properties.

For visibility, there is:

* secret: Only the password field can be secret and cannot be modified
* public: Modifiable fields that can be seen in any user

For types, there are only 3 primitive types right now:

* strg: String
* numb: Number
* bool: Boolean

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

## Motivation

I am currently in Rutgers CS336 and got interested in building my own database.

To no one's surprise, it turns out that building databases is ridiculously difficult (at least for me).

However, that did not stop me from thinking of this esoteric project.

The project allowed me to specifically hone my development skills more, having a reasonable architecture as well as having 100% test coverage.

I am not saying I wasted my time, but in hindsight, working on Twitter as a Database sounds both silly and useless...

Maybe some people will enjoy this, as it is a simple microservice that interacts with a 3rd party API.

Maybe some people will get inspired and think of their own esoteric project.

Either way, to any who read this, thanks for supporting me!

syall
