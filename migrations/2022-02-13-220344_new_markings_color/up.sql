update events set marking = 'green' where marking = 'done';
update events set marking = 'yellow' where marking = 'further_learning_required';
update events set marking = 'red' where marking = 'started';
