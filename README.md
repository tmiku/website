# the tmiku website

It starts with a fun little game idea, it turns into writing the worst CSS you've ever seen for months on end.

## Get Lost

My Strava guessing game. Mostly self-contained Javascript, but needs a running Mikuserv to handle the Strava authentication.

## Snips

My blog. Currently, this folder should just match the output directory after running snipsgen. I should wrap this into Docker.

## Maps

In progress. Maybe I should add a link to my CalTopo before I publish.

## Contact

A form to reach out, requires a running Mikuserv to send the email using the Sendgrid API.

## Deployment

Run with "docker compose up". Before running, ensure that the compose.yaml file has the correct location for the Mikuserv repo. If this works, the provided ngninx configuration file should automatically set up the reverse proxy so that the website can communicate with the backend. Important: still need to set up HTTPS before this can see the light of day!!
