import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
navItems = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    icon: 'dashboard',
    roles: ['user', 'admin'],
    exact: true
  },
  {
    label: 'Tasks',
    route: '/tasks',
    icon: 'tasks',
    roles: ['user', 'admin'],
    exact: true
  }
];


}
