#!/bin/bash
branches=$(git branch -r --no-merged origin/main | awk '$1 ~ /^origin\// && $1 != "origin/main" { print $1 }')
echo "Branch,npmrc,ROADMAP,gitVersionControl,review,security_helpers"
for branch in $branches; do
    branch_name=$(echo "$branch" | sed 's/origin\///')

    npmrc=$(git ls-tree -r "$branch" --name-only | grep -q "^.npmrc$" && echo "YES" || echo "NO")
    roadmap=$(git ls-tree -r "$branch" --name-only | grep -q "^docs/ROADMAP.md$" && echo "YES" || echo "NO")
    gvc=$(git ls-tree -r "$branch" --name-only | grep -q "^gitVersionControl.md$" && echo "YES" || echo "NO")
    review=$(git ls-tree -r "$branch" --name-only | grep -q "^review.md$" && echo "YES" || echo "NO")

    # Check for security helpers in src/utils/navigation.ts
    has_helpers="NO"
    if git ls-tree -r "$branch" --name-only | grep -q "^src/utils/navigation.ts$"; then
        content=$(git show "$branch":src/utils/navigation.ts)
        if echo "$content" | grep -q "hasDangerousProtocol" && echo "$content" | grep -q "isRelativeUrl"; then
            has_helpers="YES"
        fi
    fi

    echo "$branch_name,$npmrc,$roadmap,$gvc,$review,$has_helpers"
done
