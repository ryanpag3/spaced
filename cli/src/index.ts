#!/usr/bin/env node

import { program } from "commander";
import initialize from './cmd/init';
import runCommand from './lib/command';
import { downloadMedia, uploadMedia } from './cmd/media';

program
    .name("spaced")
    .description("CLI tool for interfacing with Spaced API.")
    .version("v1beta1");

program.command("init")
    .description("Initialize Spaced CLI.")
    // we don't wrap init inside runCommand as it is the first command to be run
    .action(async () => initialize());

const media = program.command("media")
    .description("CRUD operations for media.");

media.command("upload")
    .description("CRUD operations for media.")
    .requiredOption("-p, --path <path>", "Path to media file.")
    .action((options) => runCommand(async () => uploadMedia(options.path)));

media.command("download")
    .description("Download media.")
    .requiredOption("--id <id>", "Unique ID of the media.")
    .requiredOption("--dest <dest>", "Name of the file to write to.")
    .action((options) => runCommand(async () => downloadMedia(options.id, options.dest)));

program.parse(process.argv);