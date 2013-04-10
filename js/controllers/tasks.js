define([
	'flight/lib/component',
	'data',
	'templates',
	'controllers/task'
],
function(def, Data, Templates, TaskController){
	function component(){
		this.after("initialize", function(evt){

			this.els = {}

			var empty = true;

			this.on("emptycheck", function(force){
				if((Data.count() == 0 && !empty)||force==true) {
					this.$node.empty()
					this.$node.append(Templates.emptynotice)
					empty = true
				}
				else if(Data.count() > 0 && empty){
					this.$node.empty()
					empty = false
				}
			})

			this.on(document, "tasks:add", function (evt, task) {
				if (Data.validateTask(task)) {
					var id = Data.push(task)
					this.trigger("task:attach", id)
				} else {
					this.trigger("error", {
						text: "Task title needs to filled in and/or task time should be valid"
					})
				}
			})

			this.on(document, "tasks:import", function(){
				Data.load()
				if(Data.count() > 0){
					var tasks = Data.tasks()
					for(i = 0; i < tasks.length; i++){
						if(Data.validateTask(tasks[i])){
							this.trigger("task:attach", tasks[i].id)
						}
					}
				}
				this.trigger("tasks:update")
			})

			this.on(document, "task:attach", function(evt, id){
				this.trigger("emptycheck")
				var el = $(Templates.task.render(Data.get(id)))
				TaskController.attachTo(el, {task: id});
				this.els[id] = el;
				this.$node.append(el);
			})

			this.on(document, "task:delete", function(evt, task){
				$(this.els[task.id]).remove()
				delete this.els[task.id]
				Data.deleteTask(task)
				this.trigger("emptycheck")
				this.trigger("tasks:update")
			})

			this.on(document, "tasks:clear", function(){
				this.els = {}
				Data.deleteAllTasks()
				this.trigger("emptycheck", true)
			})
		})
	}
	return def(component)
}
)