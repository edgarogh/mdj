update events set marking = 'done' where marking = 'green';
update events set marking = 'further_learning_required' where marking = 'yellow';
update events set marking = 'started' where marking = 'red';
