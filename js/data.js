define([], function () {
	var tasks = [];
	var active = null;
	return {
		load: function(){
			this.clear()
			var local = amplify.store("donejs")
			if(local){
				this.recover(local)
			}
		},
		recover: function(obj){
			tasks = obj.tasks
			active = this.get(obj.active)
		},
		persist: function(){
			amplify.store("donejs", {tasks: tasks, active: (active ? active.id : null)})
		},
		push: function (task) {
			var id = (new Date()).getTime()
			task.id = id
			tasks.push(task)
			this.updateTimes()
			this.persist();
			return id
		},
		validateTask: function(task){
			return !isNaN(task.minutes) && task.minutes >= 0 && task.title && task.title.length > 0
		},
		deleteTask: function(task){
			if(active == task){
				this.setFirstActive(task)
			}
			else if(this.count() == 0){
				this.setActive(null)
			}
			tasks = tasks.filter(function(t){
				return t !== task
			})
			this.persist()
		},
		clear: function () {
			tasks = []
		},
		deleteAllTasks: function(){
			this.clear()
			this.persist()
		},
		setActive: function(task){
			active = task
		},
		setFirstActive: function(excluded){
			var task = null;
			for(i=0;i<tasks.length;i++){
				if(tasks[i] != excluded && tasks[i].minutes > 0){
					task = tasks[i];
					break;
				}
			}
			this.setActive(task)
		},
		active: function(){
			return active;
		},
		tasks: function () {
			return tasks;
		},
		get: function (id) {
			for (i = 0; i < tasks.length; i++) {
				if (tasks[i].id == id) {
					return tasks[i]
				}
			}
			return false;
		},
		count: function () {
			return Object.keys(tasks).length
		},
		reduceMinutes: function () {
			if(!active) return;
			active.minutes--;
			this.updateTimes()
		},
		updateTimes: function () {
			tasks.forEach(function(task){
				var hours = Math.floor(task.minutes / 60)
				var minutes = (task.minutes % 60)
				if(task.minutes > 0){

					task.time = hours + "h"

					if(hours == 0){
						task.time = minutes + "m"
					}
					else if(hours > 0 && minutes > 0 && hours <= 6){
						task.time += " " + minutes + "m"
					}
				}
			})
		}
	}
})