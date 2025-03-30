import { program } from 'commander';

program
    .name('spd')
    .description('Interface with Spaced API endpoints.')
    .version('v1beta1');

/* Authentication */
program.command('login')
    .argument('<email>', 'Email address.')
    .argument('<password>', 'Password.')
    .description('Login to Spaced API.')
    .action((email, password) => console.log(`Logging in as ${email}...`));

program.command('logout')
    .description('Logout from Spaced API.')
    .action(() => console.log('Logging out...'));

program.command('upload')
    .argument('<file>', 'File or folder to upload.')
    .description('Upload a file to Spaced API.')
    .action((file) => console.log(`Uploading ${file}...`));

program.command('download')
    .argument('<file>', 'File to download.')
    .description('Download a file from Spaced API.')
    .action((file) => console.log(`Downloading ${file}...`));

program.parse(process.argv);