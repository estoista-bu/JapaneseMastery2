<?php

namespace App\Http\Controllers;

use App\Models\UserGroup;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    /**
     * Get all groups (admin only)
     */
    public function getAllGroups()
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $groups = UserGroup::with('users:id,username,email,role')
            ->withCount('users')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'groups' => $groups
        ]);
    }

    /**
     * Create a new group (admin only)
     */
    public function createGroup(Request $request)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $group = UserGroup::create([
            'name' => $request->name,
            'description' => $request->description
        ]);

        return response()->json([
            'message' => 'Group created successfully',
            'group' => $group->load('users')->loadCount('users')
        ], 201);
    }

    /**
     * Update a group (admin only)
     */
    public function updateGroup(Request $request, $groupId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $group = UserGroup::find($groupId);
        if (!$group) {
            return response()->json(['error' => 'Group not found'], 404);
        }

        $group->update([
            'name' => $request->name,
            'description' => $request->description
        ]);

        return response()->json([
            'message' => 'Group updated successfully',
            'group' => $group->load('users')->loadCount('users')
        ]);
    }

    /**
     * Delete a group (admin only)
     */
    public function deleteGroup($groupId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $group = UserGroup::find($groupId);
        if (!$group) {
            return response()->json(['error' => 'Group not found'], 404);
        }

        $group->delete();

        return response()->json([
            'message' => 'Group deleted successfully'
        ]);
    }

    /**
     * Get available users for a group (admin only)
     */
    public function getAvailableUsers($groupId = null)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get all regular users (non-admin)
        $query = User::where('role', 'user')
            ->select('id', 'username', 'email', 'role', 'created_at');

        // If groupId is provided, exclude users already in that group
        if ($groupId) {
            $query->whereDoesntHave('groups', function($q) use ($groupId) {
                $q->where('user_group_id', $groupId);
            });
        }

        $users = $query->orderBy('username')->get();

        return response()->json([
            'users' => $users
        ]);
    }

    /**
     * Add users to a group (admin only)
     */
    public function addUsersToGroup(Request $request, $groupId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'integer|exists:users,id'
        ]);

        $group = UserGroup::find($groupId);
        if (!$group) {
            return response()->json(['error' => 'Group not found'], 404);
        }

        // Only allow adding regular users (non-admin)
        $userIds = User::whereIn('id', $request->user_ids)
            ->where('role', 'user')
            ->pluck('id')
            ->toArray();

        if (empty($userIds)) {
            return response()->json(['error' => 'No valid users to add'], 400);
        }

        // Add users to group (this will handle duplicates automatically due to unique constraint)
        $group->users()->attach($userIds);

        return response()->json([
            'message' => 'Users added to group successfully',
            'group' => $group->load('users')->loadCount('users')
        ]);
    }

    /**
     * Remove users from a group (admin only)
     */
    public function removeUsersFromGroup(Request $request, $groupId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'integer|exists:users,id'
        ]);

        $group = UserGroup::find($groupId);
        if (!$group) {
            return response()->json(['error' => 'Group not found'], 404);
        }

        $group->users()->detach($request->user_ids);

        return response()->json([
            'message' => 'Users removed from group successfully',
            'group' => $group->load('users')->loadCount('users')
        ]);
    }

    /**
     * Get group details with users (admin only)
     */
    public function getGroupDetails($groupId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $group = UserGroup::with('users:id,username,email,role,created_at')
            ->withCount('users')
            ->find($groupId);

        if (!$group) {
            return response()->json(['error' => 'Group not found'], 404);
        }

        return response()->json([
            'group' => $group
        ]);
    }
}
