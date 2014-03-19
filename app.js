
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var articleProvider = new ArticleProvider('localhost', 27017);

app.get('/', function(req, res){
    articleProvider.findAll( function(error,docs){
        res.render('index', {
            title: 'Blog',
            articles:docs
            });
    })
});

app.get('/blog/new', function(req, res) {
    res.render('blog_new', { locals: {
        title: 'New Post'
    }
    });
});

app.post('/blog/new', function(req, res){
    articleProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function( error, docs) {
        res.redirect('/')
    });
});

app.get('/blog/:id', function(req, res) {
	console.log("find by id");
    articleProvider.findById(req.params.id, function(error, doc) {
		if(error) res.send("error" +error);
		else{
			console.log("article title: "+doc.title+"\n article body: "+doc.body);
            debugger;
			res.render('blog_show',
			{ 
				art:doc
			}
			);
		}
    });
});

app.get('/blog/edit/:id', function(req,res) {
	articleProvider.findById(req.params.id, function(error,article) {
		if(error) res.send("error"+error);
		else{
		res.render('blog_edit.jade',{
		    art:article
		});
		}
	});
});

app.post('/blog/edit', function(req,res) {
	console.log("editing article ");
	articleProvider.editArticle({
		_id : req.param('_id'),
		title : req.param('title'),
		body : req.param('body')
	}
	, function( error, docs) {
		if(error) res.send("error"+error);
		else{
           res.redirect('/blog/' + req.param('_id'));
		   }
       });
});

			

app.post('/blog/addComment', function(req, res) {
    articleProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/blog/' + req.param('_id'));
       });
});




app.listen(3000);

