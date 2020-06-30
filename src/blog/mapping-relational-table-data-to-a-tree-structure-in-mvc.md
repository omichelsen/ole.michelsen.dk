---
title: Mapping relational table data to a tree structure in MVC
description: How to map SQL table data into a tree structure and display it as a nested list using recursive Razor display templates.
date: 2011-10-03
# tags: [".net", "c#", "linq", "mvc", "sql"]
---

With the advent of MVC in ASP.NET, proper object oriented code is encouraged more than ever, and Razor makes it a joy to work recursively with tree structures. So how do we go about converting our SQL table data to a tree structure?

<!-- more-->

It’s common to have tree data stored this way in a database:

![Sql2Tree SQL table data](/images/blog/mapping-relational-table-data-to-a-tree-structure-in-mvc/Sql2Tree-SQL-table-data.png)

What we want is to map this data into the following tree node structure, where each node has a parent, and optionally a set of child nodes:

```csharp
public class TreeNode
{
    public int Id;

    [ScriptIgnore]
    public int ParentId;

    [ScriptIgnore]
    public TreeNode Parent;

    public string Name;

    public List Children = new List();
}
```

The `ScriptIgnore` attributes are only there so we can serialize our nodes as JSON for a web service. In JSON you can’t have circular references, and the fields will automatically be left out of the serialized string saving precious bytes.

The ScriptIgnore attributes are only there so we can serialize our nodes as JSON for a web service. In JSON you can’t have circular references, and the fields will automatically be left out of the serialized string saving precious bytes.

```csharp
public class Tree
{
    private TreeNode rootNode;
    public TreeNode RootNode
    {
        get { return rootNode; }
        set
        {
            if (RootNode != null)
                Nodes.Remove(RootNode.Id);

            Nodes.Add(value.Id, value);
            rootNode = value;
        }
    }

    public Dictionary Nodes { get; set; }

    public Tree()
    {
    }

    public void BuildTree()
    {
        TreeNode parent;
        foreach (var node in Nodes.Values)
        {
            if (Nodes.TryGetValue(node.ParentId, out parent) &&
                node.Id != node.ParentId)
            {
                node.Parent = parent;
                parent.Children.Add(node);
            }
        }
    }
}
```

To build the tree we run through all the nodes and map each to their parent. Since we are storing the nodes in a hash table, looking up the parent of each node is only taking constant time _k_, which means we can generate our tree structure in O(_nk_) linear time which is very acceptable.

Now we can map our SQL table into our tree by using a little LINQ magic in our controller:

```csharp
private Tree GetData()
{
    var tree = new Tree();

    using (var db = new TreeEntities())
    {
        // Add each element as a tree node
        tree.Nodes = db.TreeMenu
            .Select(t => new TreeNode { Id = t.Id, ParentId = t.ParentId, Name = t.Name })
            .ToDictionary(t => t.Id);

        // Create a new root node
        tree.RootNode = new TreeNode { Id = 0, Name = "Root" };

        // Build the tree, setting parent and children references for all elements
        tree.BuildTree();
    }

    return tree;
}

public ActionResult Index()
{
    var model = GetData();
    return View(model);
}
```

To display our tree as a nested list in HTML we use a recursive display template in Razor like so:

```csharp
@model Sql2Tree.Models.TreeNode

@Model.Name
@if (Model.Children.Count > 0)
{
    <ul>
    @foreach (var node in Model.Children) {
        <li>@Html.DisplayFor(x => node)</li>
    }
    </ul>
}
```

Using the template in our view is simple:

```csharp
@model Sql2Tree.Models.Tree
<ul>
    <li>@Html.DisplayFor(x => Model.RootNode)</li>
</ul>
```

And voilá, our “flat” SQL table is now a beautiful nested tree list. This is very convenient for menus, and can easily be adapted for nested select lists and tables etc.

![Tree data displayed as a HTML nested list](/images/blog/mapping-relational-table-data-to-a-tree-structure-in-mvc/Sql2Tree-HTML-nested-list.png)

You can download the example project here, with examples of a list that does not display the root node and how to output the tree as JSON for AJAX-based menus.

> [Download Sql2Tree.zip project](/files/Sql2Tree.zip)
