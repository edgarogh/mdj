# Méthode des J

> À J0 (le jour-même où le cours a été fait par le professeur), il faut apprendre le cours. Puis le réviser le lendemain (J1), à J3, J7, J14, J28… Quand les cours s’accumulent, il faut se focaliser sur les cours que l’on connaît le moins. Pour cette méthode, il faut être particulièrement rigoureux. On vous conseille vivement de vous faire un planning ou de prendre un calendrier et de noter les cours dans celui-ci dès la fin de la matinée pour éviter d’oublier de les noter.
> 
> **🏴󠁧󠁢󠁥󠁮󠁧󠁿 Translation:** On D0 (the day you are given the lesson), you have to learn the lesson. Then revise it the next day (D1), on D3, D7, D14, D28... [...]
>
> &mdash; <cite>https://tutoratlyonest.univ-lyon1.fr/2019/08/28/les-methodes-de-travail/ </cite>

This web app allows you to create "lessons" and configure a recurrence scheme for revisions. You will then be able to quickly see what revisions need to be done on a specific day thanks to the "Timeline" tab.

The project is currently **very** work-in-progress. English translations aren't available yet as the codebase doesn't currently use a localization framework.

## Features

  * Configure the recurrence scheme on a per-lesson basis
  * Mark the progress of your revisions
  * Synchronise the timeline with Google Calendar or any other iCal-compatible calendar software

## Screenshots

<p align="center">
<img alt="Screenshot of the timeline on the home page" width="40%" src="https://user-images.githubusercontent.com/46636609/130689429-5f4ab22d-3ba6-4334-9db2-381dc22eaab1.png" hspace="5">
<img alt="Screenshot of the user's lessons on the second tab" width="40%" src="https://user-images.githubusercontent.com/46636609/130689421-c33c8b39-c73d-45f6-af2a-a5a2bc68ec99.png" hspace="5">
</p>

## Technical structure of the project

  * The front-end is made in Typescript with ReactJS and MUI, and compiled with ParcelJS.
  * The backend is made in Rust, with the Rocket framework serving an API backed by a PostgreSQL database accessed with Diesel.

## Building

To build the project, one must have a working NodeJS and `cargo` installation:

```bash
cd front
npm i
# By default, the public URL is that of my website, feel free to edit it in front/package.json
npm run build
cd ..
cargo build --release
```
