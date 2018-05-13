Showing a list or table of data in groups is very common, and fortunately also very easy to do with LINQ. In the end we want our data to look something like this:

<!-- more-->

- Group A
  - Item 1
  - Item 2
- Group B
  - Item 3

In the olden days we would probably just loop the data, and insert a group header each time we encountered a new group, but this is not especially elegant and can lead to some pretty illegible code. And while you can also achieve this [grouping with a Tree structure](mapping-relational-table-data-to-a-tree-structure-in-mvc.html "Mapping relational table data to a tree structure in MVC"), it’s a bit overkill for this application, and requires your data to have unique keys and parent keys.

LINQ fortunately contains a handy `group by` function, but unfortunately this returns an anonymous type `IEnumerable<'a>`, which we can’t use as data model for our view.

My simple solution uses a generic Group class to hold the data and a key of your own choosing to group by. By creating the Group class as a generic, we can reuse it for any kind of key and object types.

    namespace LinqGrouping.Models
    {
        public class Group<K, T>
        {
            public K Key;
            public IEnumerable<T> Values;
        }
    }

We will also create a test class called Book, and use it to create a list of books which we can then group by Genre:

    public class Book
    {
        public string Title;
        public string Author;
        public string Genre;
        public decimal Price;
    }

Create a list in a controller:

    using System.Collections.Generic;
    using System.Linq;
    using System.Web.Mvc;
    using LinqGrouping.Models;

    namespace LinqGrouping.Controllers
    {
        public class GroupingController : Controller
        {
            public ActionResult Index()
            {
                var books = new List<Book>();

                // Add test data
                books.Add(new Book { Author = "Douglas Adams", Title = "The Hitchhiker's Guide to the Galaxy", Genre = "Fiction", Price = 159.95M });
                books.Add(new Book { Author = "Scott Adams", Title = "The Dilbert Principle", Genre = "Fiction", Price = 23.95M });
                books.Add(new Book { Author = "Douglas Coupland", Title = "Generation X", Genre = "Fiction", Price = 300.00M });
                books.Add(new Book { Author = "Walter Isaacson", Title = "Steve Jobs", Genre = "Biography", Price = 219.25M });
                books.Add(new Book { Author = "Michael Freeman", Title = "The Photographer's Eye", Genre = "Photography", Price = 195.50M });

                // Group the books by Genre
                var booksGrouped = from b in books
                                   group b by b.Genre into g
                                   select new Group<string, Book> { Key = g.Key, Values = g };

                return View(booksGrouped.ToList());
            }
        }
    }

The grouping is handled with the LINQ group by statement, and here we choose the Genre field as our key to group by. Now we select our subsets into the Group object, which will consist of a key and a collection of each book which matches this key. The end result is a `List<Group<string, Book>>`, which makes it easy for us to output as HTML:

    @using LinqGrouping.Models
    @model List<Group<string, Book>>

    @{
        ViewBag.Title = "LINQ Grouping";
    }

    <h2>Grouping books by Genre</h2>

    <table>
    <thead><tr><th>Author</th><th>Title</th><th>Price</th></tr></thead>
    <tbody>
    @foreach (var group in Model)
    {
        <tr><th colspan="3">@group.Key</th></tr>
        foreach (var book in group.Values)
        {
            <tr><td>@book.Author</td><td>@book.Title</td><td>@book.Price.ToString("c")</td></tr>
        }
    }
    </tbody>
    </table>

Looping through the groups of books is very straightforward, and for each group we create a header in the table. Our code is now very easy to read, and the Group class can be reused for any other data type as well. Here is the final output:

![Books grouped by Genre](/images/blog/grouping-data-with-linq-and-mvc/Output.png)

For your reviewing pleasure, you can [download the VS project](/images/blog/grouping-data-with-linq-and-mvc/LinqGrouping.zip) and try it out yourself.

For other uses of the group by in LINQ, Microsoft have provided some [further examples](http://code.msdn.microsoft.com/LINQ-to-DataSets-Grouping-c62703ea).

