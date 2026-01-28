import {boolean, z} from 'zod';

const updateFollowRequest = z.object({
    imageId :  z.string(),
    action : z.enum(['follow', 'unfollow'])
});

export type UpdateFollowRequest = z.infer<typeof updateFollowRequest>;

const updateFollowResponse = z.object({
    success : z.boolean(),
    message : z.string(),
    data : z.object({
        count : z.number(),
    })
});

export type UpdateFollowResponse = z.infer<typeof updateFollowResponse>;