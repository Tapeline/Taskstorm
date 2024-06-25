# How idempotency on creation is achieved in Taskstorm

When an object is created, it is initially marked as 'drafted'.
Drafted objects won't be displayed anywhere and won't be accessible to anyone.
Creation of drafted objects is NOT idempotent.

Then, when client receives response from the server that confirms creation of
the object, client sends another request to 'confirm' creation. For example:
```
<- POST /api/workspaces/ 
<- {"name": "My workspace"}

-> 201 Created 
-> {"id": 1, "name": "My workspace", "is_drafted": true}

<- PATCH /api/workspaces/1/
<- {"is_drafted": false}

-> 200 OK
-> {"id": 1, "name": "My workspace", "is_drafted": false}
```
Because we edit only one object that came back from the server and using PATCH the 
idempotent way (or we can use fully idempotent PUT method) the end result is idempotent:
only one object will be 'confirmed'.

Then we can create a simple task (using cron, for example) to once in a while purge all
'drafted' objects.
