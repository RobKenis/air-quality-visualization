# Air Quality Visualization

This project processes and visualizes air quality data from <https://registry.opendata.aws/openaq/>.

## Deploying the web

```shell
cd web/
npm run build
```

Can't be bothered now to figure out the S3 sync command, so go the the console and upload the contents of the `dist/` directory into the root of the bucket and set the ACL to public read.
