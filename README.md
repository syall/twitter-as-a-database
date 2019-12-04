# Twitter as a Database

Implementing an extrememly crude DBMS that deals with:

* Basic Atomic Values with Types
* ACID Properties
* Visibility (Public and Secret)

## Installation

Generate a host.key and host.cert file in the config folder:

```bash
openssl genrsa 2048 > host.key
chmod 400 host.key
openssl req -new -x509 -nodes -sha256 -days 365 -key host.key -out host.cert
```

Configure a dotenv file in the root folder:

```bash
# Hosting Variables
HOST
PORT

# Twitter API Keys
CONSUMER_PUBLIC_KEY
CONSUMER_SECRET_KEY
ACCESS_PUBLIC_KEY
ACCESS_SECRET_KEY

# Default Database screen_name
DEFAULT_DB

# SSL
SSL_ENABLED
```
